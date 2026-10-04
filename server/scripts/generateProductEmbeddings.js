#!/usr/bin/env node

/**
 * Script: generateProductEmbeddings.js
 * 
 * Generates vector embeddings for existing products in MongoDB using
 * the active embedding model (OpenAI or local Transformers.js).
 * 
 * Usage:
 *   node scripts/generateProductEmbeddings.js [options]
 * 
 * Options:
 *   --force       Regenerate embeddings for all products, even those with existing embeddings
 *   --dry-run     Run without persisting changes to MongoDB
 *   --limit=N     Process only up to N products
 *   --batch=N     Batch size (default: 10)
 *   --model-info  Print current embedding model info and exit
 *   --help        Show help message
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const db = require('../db/dbConnection');
const {
  buildSearchableText,
  generateEmbedding,
  getEmbeddingDimensions,
  getActiveModelName,
} = require('../services/embeddingService');

// Parse command line arguments
const args = process.argv.slice(2);
const isForce = args.includes('--force');
const isDryRun = args.includes('--dry-run');
const isHelp = args.includes('--help') || args.includes('-h');
const isModelInfo = args.includes('--model-info');

const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0;

const batchArg = args.find(a => a.startsWith('--batch='));
const batchSize = batchArg ? parseInt(batchArg.split('=')[1], 10) : 10;

if (isHelp) {
  console.log(`
===========================================================
  E-Commerce Product Vector Embedding Migration Script
===========================================================

Description:
  Scans the products collection in MongoDB, builds comprehensive
  searchable text, and generates vector embeddings using the active
  embedding model (OpenAI or local Transformers.js sentence-transformer).

  Priority:
    1. OpenAI (if OPENAI_API_KEY is set) — 1536 dimensions
    2. Local model (Xenova/all-MiniLM-L6-v2) — 384 dimensions

Usage:
  node scripts/generateProductEmbeddings.js [options]

Options:
  --force       Regenerate embeddings for all products, even if they already exist
  --dry-run     Simulate embedding generation without writing to the database
  --limit=N     Limit processing to the first N products
  --batch=N     Number of products per batch (default: 10)
  --model-info  Print current embedding model details and exit
  --help        Display this help message

Examples:
  node scripts/generateProductEmbeddings.js
  node scripts/generateProductEmbeddings.js --force
  node scripts/generateProductEmbeddings.js --dry-run --limit=5
  node scripts/generateProductEmbeddings.js --model-info
`);
  process.exit(0);
}

if (isModelInfo) {
  const modelName = getActiveModelName();
  const dims = getEmbeddingDimensions();
  console.log(`
===========================================================
  Active Embedding Model Info
===========================================================
  Model:       ${modelName}
  Dimensions:  ${dims}
  Source:      ${modelName.startsWith('openai:') ? 'OpenAI API (paid)' : 'Local Transformers.js (free)'}
===========================================================
`);
  process.exit(0);
}

async function main() {
  const activeModel = getActiveModelName();
  const activeDims = getEmbeddingDimensions();

  console.log('===========================================================');
  console.log(' Starting Product Vector Embedding Generation');
  console.log('===========================================================');
  console.log(`Model:     ${activeModel}`);
  console.log(`Dims:      ${activeDims}`);
  console.log(`Mode:      ${isDryRun ? 'DRY-RUN (No database writes)' : 'LIVE'}`);
  console.log(`Force:     ${isForce ? 'YES (Regenerating all)' : 'NO (Skipping existing)'}`);
  if (limit > 0) console.log(`Limit:     ${limit} products`);
  console.log(`Batch:     ${batchSize}`);
  console.log('-----------------------------------------------------------');

  const startTime = Date.now();
  let collection;

  try {
    collection = await db.connectProductsDb();
  } catch (connErr) {
    console.error('Failed to connect to MongoDB:', connErr.message);
    process.exit(1);
  }

  // Fetch all products
  let cursor = collection.find({});
  if (limit > 0) cursor = cursor.limit(limit);

  const products = await cursor.toArray();
  const total = products.length;

  console.log(`Found ${total} total products in database.\n`);

  if (total === 0) {
    console.log('No products found in the collection. Nothing to process.');
    await db.closeEcomerceDB();
    process.exit(0);
  }

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  let modelMismatchCount = 0;

  for (let i = 0; i < total; i++) {
    const product = products[i];
    const indexStr = `[${i + 1}/${total}]`;
    const productName = product.name || 'Unnamed Product';
    const productId = product._id.toString();
    const progress = ((i + 1) / total * 100).toFixed(1);

    // Check if product already has valid embeddings from the SAME model
    const hasEmbedding = Array.isArray(product.embedding) && product.embedding.length > 0;
    const sameModel = product.embeddingModel === activeModel;

    if (hasEmbedding && !isForce) {
      // If the model has changed, auto-force regeneration for this product
      if (!sameModel && product.embeddingModel) {
        console.log(`${indexStr} [${progress}%] MODEL CHANGE: "${productName}" (${product.embeddingModel} → ${activeModel}). Regenerating...`);
        modelMismatchCount++;
      } else if (sameModel) {
        console.log(`${indexStr} [${progress}%] SKIP: "${productName}" already has ${activeModel} embedding.`);
        skippedCount++;
        continue;
      }
      // If no embeddingModel recorded, treat as needing regeneration
    } else if (hasEmbedding && isForce) {
      // Force mode — regenerate regardless
    }

    try {
      // 1. Build rich searchable text
      const searchableText = buildSearchableText({
        name: product.name,
        productDescription: product.productDescription || product.description,
        category: product.category,
        brand: product.brand || product.company,
        tags: product.tags,
      });

      // 2. Generate vector embedding
      const { embedding, source, model, dimensions } = await generateEmbedding(searchableText, { useCache: false });

      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('Embedding returned was empty or invalid');
      }

      if (source === 'failed') {
        throw new Error('All embedding methods failed');
      }

      // 3. Persist to MongoDB if not dry run
      if (!isDryRun) {
        await collection.updateOne(
          { _id: product._id },
          {
            $set: {
              searchableText,
              embedding,
              embeddingVersion: '2.0',
              embeddingModel: model,
              embeddingUpdatedAt: new Date(),
            }
          }
        );
      }

      console.log(`${indexStr} [${progress}%] OK: "${productName}" → ${dimensions}d vector (${source}: ${model})`);
      updatedCount++;

      // Small pause between batches to prevent API rate limiting
      if ((i + 1) % batchSize === 0 && i + 1 < total) {
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (itemErr) {
      console.error(`${indexStr} [${progress}%] ERROR: "${productName}" (ID: ${productId}) - ${itemErr.message}`);
      errorCount++;
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n===========================================================');
  console.log(' Migration Summary');
  console.log('===========================================================');
  console.log(`Active Model:    ${activeModel} (${activeDims}d)`);
  console.log(`Total Products:  ${total}`);
  console.log(`Updated:         ${updatedCount}`);
  console.log(`Skipped:         ${skippedCount}`);
  console.log(`Model Changes:   ${modelMismatchCount}`);
  console.log(`Errors:          ${errorCount}`);
  console.log(`Elapsed Time:    ${durationSec}s`);
  if (isDryRun) {
    console.log(`\n  ⚠  DRY-RUN mode — no database changes were made.`);
    console.log(`     Remove --dry-run to persist embeddings.`);
  }
  console.log('===========================================================');

  try {
    await db.closeEcomerceDB();
  } catch {
    // Ignore close error on exit
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Fatal error during embedding migration:', err);
  try {
    await db.closeEcomerceDB();
  } catch {}
  process.exit(1);
});
