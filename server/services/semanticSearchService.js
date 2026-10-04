const db = require('../db/dbConnection');
const config = require('../config');
const { generateEmbedding, cosineSimilarity } = require('./embeddingService');

/**
 * Perform keyword-based regex search across multiple fields
 * Matches name, productDescription, category, brand, company, and tags
 */
async function performKeywordSearch(collection, queryText, limit = 50) {
  if (!queryText || queryText.trim() === '') return [];

  // Split query into significant terms
  const tokens = queryText
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 1)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (tokens.length === 0) return [];

  // Match any token in name, description, company, brand, category, tags
  const regexPattern = tokens.join('|');
  const regex = new RegExp(regexPattern, 'i');

  const filter = {
    $or: [
      { name: { $regex: regex } },
      { productDescription: { $regex: regex } },
      { company: { $regex: regex } },
      { brand: { $regex: regex } },
      { category: { $regex: regex } },
      { tags: { $in: tokens.map(t => new RegExp(t, 'i')) } },
      { searchableText: { $regex: regex } }
    ]
  };

  const results = await collection.find(filter).limit(limit).toArray();

  // Compute a simple textual relevance score based on token occurrences
  return results.map(prod => {
    const fullText = `${prod.name || ''} ${prod.company || ''} ${prod.brand || ''} ${prod.category || ''} ${prod.productDescription || ''}`.toLowerCase();
    let matchCount = 0;
    tokens.forEach(tok => {
      const lowerTok = tok.toLowerCase();
      if (prod.name && prod.name.toLowerCase().includes(lowerTok)) matchCount += 3; // Name match gets highest weight
      if (prod.company && prod.company.toLowerCase().includes(lowerTok)) matchCount += 2;
      if (prod.category && prod.category.toLowerCase().includes(lowerTok)) matchCount += 2;
      if (fullText.includes(lowerTok)) matchCount += 1;
    });

    const maxScore = tokens.length * 3;
    const keywordScore = Math.min(1.0, matchCount / (maxScore || 1));

    return {
      product: prod,
      keywordScore: Number(keywordScore.toFixed(3)),
    };
  });
}

/**
 * Execute vector search using MongoDB Atlas $vectorSearch pipeline stage
 */
async function performAtlasVectorSearch(collection, queryEmbedding, indexName, limit = 50) {
  const pipeline = [
    {
      $vectorSearch: {
        index: indexName,
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: Math.max(100, limit * 3),
        limit: limit,
      }
    },
    {
      $addFields: {
        vectorScore: { $meta: 'vectorSearchScore' }
      }
    }
  ];

  const results = await collection.aggregate(pipeline).toArray();
  return results.map(doc => ({
    product: doc,
    vectorScore: Number((doc.vectorScore || 0).toFixed(4)),
  }));
}

/**
 * Local / Standalone MongoDB vector search fallback
 * Uses in-memory cosine similarity computation over product embeddings
 */
async function performLocalVectorSearch(collection, queryEmbedding, limit = 50) {
  const queryDims = queryEmbedding.length;

  // Query all products that have an embedding array populated
  const candidates = await collection
    .find({
      embedding: { $exists: true, $type: 'array', $ne: [] }
    })
    .limit(200)
    .toArray();

  const scored = [];
  let dimensionMismatchCount = 0;

  for (const doc of candidates) {
    if (Array.isArray(doc.embedding) && doc.embedding.length > 0) {
      // Skip products whose embedding dimensions don't match the query
      // This occurs during the transition between different embedding models
      if (doc.embedding.length !== queryDims) {
        dimensionMismatchCount++;
        continue;
      }
      const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
      if (similarity > 0) {
        scored.push({
          product: doc,
          vectorScore: similarity,
        });
      }
    }
  }

  if (dimensionMismatchCount > 0) {
    console.warn(
      `[SemanticSearch] Skipped ${dimensionMismatchCount} products with incompatible embedding dimensions ` +
      `(query: ${queryDims}d). Run "npm run generate:embeddings -- --force" to re-generate all embeddings.`
    );
  }

  // Sort descending by cosine similarity
  scored.sort((a, b) => b.vectorScore - a.vectorScore);
  return scored.slice(0, limit);
}

/**
 * Hybrid Reciprocal Rank Fusion (RRF) & Score Combination
 * Intelligently merges keyword search results and semantic vector results
 */
function fuseHybridResults(keywordResults, vectorResults, k = 60) {
  const scoreMap = new Map();

  // 1. Process Vector Results
  vectorResults.forEach((item, rank) => {
    const id = item.product._id.toString();
    const rrfScore = 1.0 / (k + rank + 1);
    scoreMap.set(id, {
      product: item.product,
      vectorRank: rank + 1,
      keywordRank: null,
      vectorScore: item.vectorScore || 0,
      keywordScore: 0,
      rrfScore: rrfScore,
      matchType: 'semantic'
    });
  });

  // 2. Process Keyword Results
  keywordResults.forEach((item, rank) => {
    const id = item.product._id.toString();
    const rrfScore = 1.0 / (k + rank + 1);

    if (scoreMap.has(id)) {
      const existing = scoreMap.get(id);
      existing.keywordRank = rank + 1;
      existing.keywordScore = item.keywordScore || 0;
      existing.rrfScore += rrfScore;
      existing.matchType = 'hybrid';
    } else {
      scoreMap.set(id, {
        product: item.product,
        vectorRank: null,
        keywordRank: rank + 1,
        vectorScore: 0,
        keywordScore: item.keywordScore || 0,
        rrfScore: rrfScore,
        matchType: 'exact'
      });
    }
  });

  // 3. Convert to array and calculate composite similarity score (0.0 to 1.0)
  const fusedList = Array.from(scoreMap.values()).map(item => {
    let compositeScore = 0;
    if (item.matchType === 'hybrid') {
      // 60% semantic + 40% keyword with hybrid boost
      compositeScore = (item.vectorScore * 0.6) + (item.keywordScore * 0.4);
      compositeScore = Math.min(1.0, compositeScore * 1.15);
    } else if (item.matchType === 'semantic') {
      compositeScore = item.vectorScore;
    } else {
      // Exact keyword only
      compositeScore = item.keywordScore;
    }

    return {
      product: {
        ...item.product,
        price: Number(item.product.price) || 0,
        originalPrice: Number(item.product.originalPrice || item.product.price) || 0,
        discountPercentage: Number(item.product.discountPercentage) || 0,
      },
      similarityScore: Number(compositeScore.toFixed(3)),
      matchType: item.matchType,
      rrfScore: item.rrfScore,
    };
  });

  // Sort by composite score (or RRF score) descending
  fusedList.sort((a, b) => b.similarityScore - a.similarityScore);

  return fusedList;
}

/**
 * Main Semantic / Hybrid Search Function
 *
 * @param {string} queryString Search query entered by the user
 * @param {Object} options Options including page, limit, minScore
 * @returns {Promise<Object>} Search results with pagination and metadata
 */
async function searchProducts(queryString, options = {}) {
  const page = Math.max(1, parseInt(options.page) || 1);
  const limit = Math.max(1, parseInt(options.limit) || 8);
  const minScore = parseFloat(options.minScore) || 0.05;
  const skip = (page - 1) * limit;

  const collection = await db.connectProductsDb();

  // If query is empty, return standard product list
  if (!queryString || queryString.trim() === '') {
    const totalCount = await collection.countDocuments({});
    const productList = await collection
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const formattedList = productList.map(p => ({
      ...p,
      price: Number(p.price) || 0,
      originalPrice: Number(p.originalPrice || p.price) || 0,
      discountPercentage: Number(p.discountPercentage) || 0,
      similarityScore: null,
      matchType: 'all',
    }));

    return {
      err: false,
      query: '',
      products: formattedList,
      allProducts: formattedList,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit) || 1,
      searchMode: 'default'
    };
  }

  const cleanQuery = queryString.trim();

  // 1. Generate query embedding (cached if identical query was searched recently)
  const { embedding: queryEmbedding, source: embeddingSource } = await generateEmbedding(
    cleanQuery,
    { useCache: true }
  );

  let vectorResults = [];
  let vectorMode = 'atlas';
  const atlasIndexName = process.env.MONGODB_ATLAS_VECTOR_INDEX || config.MONGODB_ATLAS_VECTOR_INDEX || 'vector_index';

  // 2. Try Atlas Vector Search first
  try {
    vectorResults = await performAtlasVectorSearch(collection, queryEmbedding, atlasIndexName, 40);
  } catch (atlasError) {
    // Graceful fallback to local in-memory cosine similarity
    vectorMode = 'local_fallback';
    try {
      vectorResults = await performLocalVectorSearch(collection, queryEmbedding, 40);
    } catch (localError) {
      console.error('[SemanticSearch] Vector search error:', localError.message);
      vectorResults = [];
    }
  }

  // 3. Run parallel keyword search
  let keywordResults = [];
  try {
    keywordResults = await performKeywordSearch(collection, cleanQuery, 40);
  } catch (kwError) {
    console.error('[SemanticSearch] Keyword search error:', kwError.message);
    keywordResults = [];
  }

  // 4. Fuse results using Hybrid RRF
  const fusedList = fuseHybridResults(keywordResults, vectorResults);

  // 5. Apply minimum relevance threshold
  const filtered = fusedList.filter(item => item.similarityScore >= minScore);

  // If filtered is empty, take top results regardless of minScore so user gets closest matches
  const candidateResults = filtered.length > 0 ? filtered : fusedList;

  const totalCount = candidateResults.length;
  const paginatedItems = candidateResults.slice(skip, skip + limit);

  const formattedProducts = paginatedItems.map(item => ({
    ...item.product,
    similarityScore: item.similarityScore,
    matchType: item.matchType,
  }));

  return {
    err: false,
    query: cleanQuery,
    products: formattedProducts,
    allProducts: formattedProducts,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit) || 1,
    searchMode: 'hybrid',
    vectorMode,
    embeddingSource,
  };
}

module.exports = {
  searchProducts,
  performKeywordSearch,
  performAtlasVectorSearch,
  performLocalVectorSearch,
  fuseHybridResults,
};
