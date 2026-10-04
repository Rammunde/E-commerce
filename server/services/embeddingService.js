const OpenAI = require('openai');
const config = require('../config');

// ─────────────────────────────────────────────────────────────────────────────
// In-memory LRU-style cache for query embeddings to avoid redundant API/model
// calls and reduce latency
// ─────────────────────────────────────────────────────────────────────────────
const EMBEDDING_CACHE = new Map();
const MAX_CACHE_SIZE = 500;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─────────────────────────────────────────────────────────────────────────────
// Local Embedding Model — Lazy-loaded singleton
// Uses @huggingface/transformers (Transformers.js v3) with ONNX Runtime
// Model: Xenova/all-MiniLM-L6-v2 (384 dimensions, ~80MB)
// ─────────────────────────────────────────────────────────────────────────────
let _localPipelinePromise = null;
let _localModelName = null;

const LOCAL_MODEL_DIMENSIONS = 384;
const OPENAI_MODEL_DIMENSIONS = 1536;

/**
 * Lazily initialize the local sentence-transformer pipeline.
 * The model is downloaded and cached on first call (~80MB).
 * Subsequent calls return the same pipeline instance immediately.
 *
 * @returns {Promise<Function>} The feature-extraction pipeline
 */
function getLocalPipeline() {
  if (!_localPipelinePromise) {
    _localModelName = process.env.LOCAL_EMBEDDING_MODEL || config.LOCAL_EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2';
    console.log(`[EmbeddingService] Loading local embedding model: ${_localModelName} ...`);
    console.log(`[EmbeddingService] First load will download the model (~80MB). This is cached for subsequent runs.`);
    const loadStart = Date.now();

    _localPipelinePromise = (async () => {
      try {
        const { pipeline } = await import('@huggingface/transformers');
        const pipe = await pipeline('feature-extraction', _localModelName, {
          // Use default ONNX quantized model for faster CPU inference
          dtype: 'fp32',
        });
        const loadTime = ((Date.now() - loadStart) / 1000).toFixed(2);
        console.log(`[EmbeddingService] Local model "${_localModelName}" loaded in ${loadTime}s (${LOCAL_MODEL_DIMENSIONS}d vectors)`);
        return pipe;
      } catch (err) {
        // Reset promise so a retry is possible on next call
        _localPipelinePromise = null;
        console.error(`[EmbeddingService] Failed to load local model "${_localModelName}":`, err.message);
        throw err;
      }
    })();
  }
  return _localPipelinePromise;
}

/**
 * Generate embedding using the local sentence-transformer model.
 * Returns a normalized 384-dimensional vector with real semantic understanding.
 *
 * @param {string} text Input text
 * @returns {Promise<number[]>} 384-dim embedding vector
 */
async function generateLocalEmbedding(text) {
  const pipe = await getLocalPipeline();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  // output is a Tensor — convert to a flat JS array
  const embedding = Array.from(output.data);
  return embedding;
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI Client
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize OpenAI client dynamically to pick up any environment variable changes
 */
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || config.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.trim() === 'your_openai_api_key_here') {
    return null;
  }
  return new OpenAI({ apiKey: apiKey.trim() });
}

// ─────────────────────────────────────────────────────────────────────────────
// Searchable Text Construction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construct searchable text from product attributes
 * Follows the format: Name + Description + Category + Brand/Company + Tags
 *
 * @param {Object} product
 * @returns {string} Clean, normalized searchable text
 */
function buildSearchableText(product = {}) {
  const name = product.name || '';
  const description = product.productDescription || product.description || '';
  const category = product.category || '';
  const brand = product.brand || product.company || '';

  let tagsStr = '';
  if (Array.isArray(product.tags)) {
    tagsStr = product.tags.filter(Boolean).join(' ');
  } else if (typeof product.tags === 'string') {
    tagsStr = product.tags;
  }

  // Combine non-empty attributes cleanly
  const sections = [
    name.trim(),
    description.trim(),
    category.trim() ? `Category: ${category.trim()}` : '',
    brand.trim() ? `Brand: ${brand.trim()}` : '',
    tagsStr.trim() ? `Tags: ${tagsStr.trim()}` : ''
  ].filter(Boolean);

  return sections.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Embedding Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate vector embedding for the given text.
 *
 * Priority:
 *   1. OpenAI API (text-embedding-3-small, 1536d) — if OPENAI_API_KEY is set
 *   2. Local Transformers.js model (all-MiniLM-L6-v2, 384d) — free, no API key
 *
 * @param {string} text Input text to embed
 * @param {Object} options
 * @param {boolean} options.useCache Whether to check and store in query cache
 * @returns {Promise<{ embedding: number[], source: string, dimensions: number, model: string }>}
 */
async function generateEmbedding(text, options = { useCache: false }) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    const dims = getEmbeddingDimensions();
    return {
      embedding: new Array(dims).fill(0),
      source: 'empty',
      dimensions: dims,
      model: 'none',
    };
  }

  const cleanText = text.trim();
  const cacheKey = cleanText.toLowerCase();

  // 1. Check in-memory cache if enabled
  if (options.useCache && EMBEDDING_CACHE.has(cacheKey)) {
    const cached = EMBEDDING_CACHE.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        embedding: cached.embedding,
        source: 'cache',
        dimensions: cached.embedding.length,
        model: cached.model || 'cached',
      };
    } else {
      EMBEDDING_CACHE.delete(cacheKey);
    }
  }

  const openai = getOpenAIClient();
  const openaiModel = process.env.OPENAI_EMBEDDING_MODEL || config.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

  // 2. Try OpenAI API if client is available
  if (openai) {
    try {
      const response = await openai.embeddings.create({
        model: openaiModel,
        input: cleanText,
      });

      const embedding = response?.data?.[0]?.embedding;
      if (Array.isArray(embedding) && embedding.length > 0) {
        if (options.useCache) {
          saveToCache(cacheKey, embedding, `openai:${openaiModel}`);
        }
        return {
          embedding,
          source: 'openai',
          dimensions: embedding.length,
          model: `openai:${openaiModel}`,
        };
      }
    } catch (error) {
      console.warn(`[EmbeddingService] OpenAI embedding failed: ${error.message}. Falling back to local model.`);
    }
  } else {
    // Helpful log when key is missing (once)
    if (!generateEmbedding._keyNoticeLogged) {
      console.log('[EmbeddingService] OPENAI_API_KEY not set. Using local sentence-transformer model for semantic embeddings.');
      generateEmbedding._keyNoticeLogged = true;
    }
  }

  // 3. Use local sentence-transformer model (real semantic embeddings)
  try {
    const localModel = process.env.LOCAL_EMBEDDING_MODEL || config.LOCAL_EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2';
    const embedding = await generateLocalEmbedding(cleanText);

    if (Array.isArray(embedding) && embedding.length > 0) {
      if (options.useCache) {
        saveToCache(cacheKey, embedding, localModel);
      }
      return {
        embedding,
        source: 'local',
        dimensions: embedding.length,
        model: localModel,
      };
    }
  } catch (localError) {
    console.error(`[EmbeddingService] Local embedding model failed: ${localError.message}`);
  }

  // 4. All embedding methods failed — return zero vector
  console.error('[EmbeddingService] All embedding methods failed. Returning zero vector.');
  const dims = getEmbeddingDimensions();
  return {
    embedding: new Array(dims).fill(0),
    source: 'failed',
    dimensions: dims,
    model: 'none',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return the active embedding dimensions based on the configured provider.
 * OpenAI text-embedding-3-small = 1536d, local all-MiniLM-L6-v2 = 384d
 *
 * @returns {number} Embedding vector dimensions
 */
function getEmbeddingDimensions() {
  const openai = getOpenAIClient();
  return openai ? OPENAI_MODEL_DIMENSIONS : LOCAL_MODEL_DIMENSIONS;
}

/**
 * Return the name of the currently active embedding model.
 *
 * @returns {string} Model identifier string
 */
function getActiveModelName() {
  const openai = getOpenAIClient();
  if (openai) {
    return `openai:${process.env.OPENAI_EMBEDDING_MODEL || config.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'}`;
  }
  return process.env.LOCAL_EMBEDDING_MODEL || config.LOCAL_EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2';
}

/**
 * Cache helper with size limit enforcement
 */
function saveToCache(key, embedding, model) {
  if (EMBEDDING_CACHE.size >= MAX_CACHE_SIZE) {
    // Delete oldest entry (first key in Map iterator)
    const oldestKey = EMBEDDING_CACHE.keys().next().value;
    EMBEDDING_CACHE.delete(oldestKey);
  }
  EMBEDDING_CACHE.set(key, {
    embedding,
    model,
    timestamp: Date.now(),
  });
}

/**
 * Compute Cosine Similarity between two numeric vectors of equal length
 * Returns a value between -1.0 and 1.0 (typically 0.0 to 1.0 for normalized embeddings)
 *
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} Cosine similarity score
 */
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }

  const length = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Number(similarity.toFixed(4));
}

module.exports = {
  buildSearchableText,
  generateEmbedding,
  generateLocalEmbedding,
  cosineSimilarity,
  getOpenAIClient,
  getEmbeddingDimensions,
  getActiveModelName,
  LOCAL_MODEL_DIMENSIONS,
  OPENAI_MODEL_DIMENSIONS,
};
