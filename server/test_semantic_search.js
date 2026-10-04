const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const {
  buildSearchableText,
  generateEmbedding,
  cosineSimilarity,
  getEmbeddingDimensions,
  getActiveModelName,
} = require('./services/embeddingService');
const { searchProducts, fuseHybridResults } = require('./services/semanticSearchService');

async function runTests() {
  const activeModel = getActiveModelName();
  const expectedDims = getEmbeddingDimensions();

  console.log('=== RUNNING SEMANTIC SEARCH UNIT & INTEGRATION TESTS ===\n');
  console.log(`Active Model: ${activeModel}`);
  console.log(`Expected Dimensions: ${expectedDims}\n`);

  // Test 1: Searchable Text Construction
  console.log('1. Testing buildSearchableText...');
  const sampleProduct = {
    name: 'Nike Air Zoom Pegasus',
    productDescription: 'Breathable lightweight running shoes designed for marathons and daily training',
    category: 'Footwear',
    brand: 'Nike',
    tags: ['running', 'cushioned', 'athletic', 'sneakers']
  };
  const text = buildSearchableText(sampleProduct);
  console.log('Searchable Text:\n---\n' + text + '\n---');
  if (!text.includes('Nike Air Zoom Pegasus') || !text.includes('Category: Footwear') || !text.includes('running')) {
    throw new Error('buildSearchableText failed validation');
  }
  console.log('✓ buildSearchableText passed!\n');

  // Test 2: Embedding Generation (local model or OpenAI)
  console.log('2. Testing generateEmbedding...');
  const emb1 = await generateEmbedding(text, { useCache: true });
  console.log(`Vector 1 dimensions: ${emb1.embedding.length}, source: ${emb1.source}, model: ${emb1.model}`);
  if (!Array.isArray(emb1.embedding) || emb1.embedding.length !== expectedDims) {
    throw new Error(`generateEmbedding failed: expected ${expectedDims} dimensions, got ${emb1.embedding.length}`);
  }
  if (emb1.source === 'failed') {
    throw new Error('generateEmbedding returned failed source — model not loaded');
  }

  // Cache test
  const embCached = await generateEmbedding(text, { useCache: true });
  console.log(`Vector 1 cached check: source = ${embCached.source}`);
  if (embCached.source !== 'cache') {
    console.warn('Warning: expected cache hit on second call with same text');
  }
  console.log('✓ generateEmbedding passed!\n');

  // Test 3: Semantic Similarity — Running Shoes
  console.log('3. Testing semantic similarity (running shoes vs. microwave)...');
  const queryEmb = await generateEmbedding('comfortable shoes for jogging', { useCache: true });
  const unrelatedEmb = await generateEmbedding('kitchen microwave stainless steel oven 1000W', { useCache: true });

  const simMatch = cosineSimilarity(queryEmb.embedding, emb1.embedding);
  const simUnrelated = cosineSimilarity(queryEmb.embedding, unrelatedEmb.embedding);
  console.log(`  "comfortable shoes for jogging" vs "Nike Air Zoom Pegasus running shoes": ${simMatch}`);
  console.log(`  "comfortable shoes for jogging" vs "kitchen microwave oven":              ${simUnrelated}`);

  if (simMatch <= simUnrelated) {
    throw new Error(
      `SEMANTIC FAILURE: Running shoes query (${simMatch}) should score higher than microwave (${simUnrelated}). ` +
      'The embedding model is not providing real semantic understanding.'
    );
  }
  console.log('✓ Semantic relevance confirmed: shoes > microwave!\n');

  // Test 4: Semantic Similarity — Laptop for Coding
  console.log('4. Testing semantic similarity (laptop for coding vs. garden furniture)...');
  const laptopProductEmb = await generateEmbedding(
    'High-performance programming laptop with 32GB RAM and fast SSD for developers',
    { useCache: true }
  );
  const laptopQueryEmb = await generateEmbedding('laptop for coding', { useCache: true });
  const gardenEmb = await generateEmbedding('outdoor garden furniture wooden table and chairs', { useCache: true });

  const simLaptop = cosineSimilarity(laptopQueryEmb.embedding, laptopProductEmb.embedding);
  const simGarden = cosineSimilarity(laptopQueryEmb.embedding, gardenEmb.embedding);
  console.log(`  "laptop for coding" vs "programming laptop":   ${simLaptop}`);
  console.log(`  "laptop for coding" vs "garden furniture":      ${simGarden}`);

  if (simLaptop <= simGarden) {
    throw new Error(
      `SEMANTIC FAILURE: Laptop query (${simLaptop}) should score higher than garden furniture (${simGarden}). ` +
      'The embedding model is not providing real semantic understanding.'
    );
  }
  console.log('✓ Semantic relevance confirmed: laptops > garden furniture!\n');

  // Test 5: Synonym/Paraphrase Similarity
  console.log('5. Testing synonym similarity (sneakers vs running shoes)...');
  const sneakersEmb = await generateEmbedding('sneakers for running', { useCache: true });
  const runShoesEmb = await generateEmbedding('running shoes for athletics', { useCache: true });
  const cookwareEmb = await generateEmbedding('stainless steel cooking pots and pans set', { useCache: true });

  const simSynonym = cosineSimilarity(sneakersEmb.embedding, runShoesEmb.embedding);
  const simCookware = cosineSimilarity(sneakersEmb.embedding, cookwareEmb.embedding);
  console.log(`  "sneakers for running" vs "running shoes for athletics": ${simSynonym}`);
  console.log(`  "sneakers for running" vs "cooking pots and pans":       ${simCookware}`);

  if (simSynonym <= simCookware) {
    throw new Error(
      `SEMANTIC FAILURE: Synonym similarity (${simSynonym}) should exceed unrelated (${simCookware}).`
    );
  }
  console.log('✓ Synonym similarity confirmed!\n');

  // Test 6: Embedding Migration Script in Dry-Run
  console.log('6. Testing embedding migration script with --dry-run...');
  const { execSync } = require('child_process');
  const dryRunOutput = execSync('node scripts/generateProductEmbeddings.js --dry-run --limit=5', {
    cwd: __dirname,
    encoding: 'utf8'
  });
  console.log('Dry run output snippet:\n' + dryRunOutput.split('\n').slice(0, 15).join('\n'));
  console.log('✓ Migration script dry-run successful!\n');

  console.log('=== ALL TESTS COMPLETED SUCCESSFULLY ===');
  console.log(`\nModel: ${activeModel} | Dimensions: ${expectedDims}`);
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
