const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = require('./db/dbConnection');
const { generateReviewAnalysis } = require('./services/reviewAnalysisService');
const { computeAndSaveAnalysis } = require('./services/review.service');

async function testReviewSystem() {
  console.log('=== RUNNING REVIEW ANALYSIS UNIT & INTEGRATION TESTS ===\n');

  // Test 1: Fallback NLP Sentiment Analysis on Sample Reviews
  console.log('1. Testing generateReviewAnalysis with sample phone reviews...');
  const sampleReviews = [
    { rating: 5, comment: 'Amazing battery life and wonderful display colors!' },
    { rating: 4, comment: 'Good performance, but charging is slow.' },
    { rating: 2, comment: 'Camera quality is poor in low light conditions.' },
    { rating: 5, comment: 'Love the premium build quality and snappy response.' }
  ];

  const analysis = await generateReviewAnalysis(sampleReviews, { name: 'Test Smartphone' });
  console.log('Analysis Result:\n', JSON.stringify({
    overallSentiment: analysis.overallSentiment,
    distribution: analysis.sentimentDistribution,
    positiveHighlights: analysis.positiveHighlights,
    negativeHighlights: analysis.negativeHighlights,
    actionableInsights: analysis.actionableInsights,
  }, null, 2));

  if (!analysis.overallSentiment || !analysis.sentimentDistribution) {
    throw new Error('Analysis structure validation failed');
  }
  console.log('✓ generateReviewAnalysis passed!\n');

  // Test 2: Verify Database Persistence & Cache Retrieval
  console.log('2. Testing MongoDB review analysis persistence and retrieval...');
  const productsColl = await db.connectProductsDb();
  const reviewsColl = await db.connectReviewsDb();
  const analysisColl = await db.connectReviewAnalysisDb();

  const product = await productsColl.findOne({});
  if (!product) {
    throw new Error('No product found in database to test');
  }
  const productIdStr = product._id.toString();

  // Save analysis
  const savedDoc = await computeAndSaveAnalysis(productIdStr, reviewsColl, analysisColl, productsColl);
  console.log(`Saved analysis for "${product.name}" with review count: ${savedDoc.analyzedReviewCount}`);

  // Retrieve cached
  const cachedDoc = await analysisColl.findOne({ productId: product._id });
  if (!cachedDoc || cachedDoc.analyzedReviewCount !== savedDoc.analyzedReviewCount) {
    throw new Error('Cached document retrieval mismatch');
  }
  console.log('✓ MongoDB analysis persistence and cache matching passed!\n');

  console.log('=== ALL REVIEW ANALYSIS TESTS PASSED SUCCESSFULLY ===');
  await db.closeEcomerceDB();
  process.exit(0);
}

testReviewSystem().catch(async (err) => {
  console.error('Test error:', err);
  try { await db.closeEcomerceDB(); } catch { }
  process.exit(1);
});
