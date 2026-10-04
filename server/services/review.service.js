const { ObjectId } = require('mongodb');
const db = require('../db/dbConnection');
const { generateReviewAnalysis } = require('./reviewAnalysisService');

/**
 * Helper to update review analysis in the database
 */
async function computeAndSaveAnalysis(productIdStr, collectionReviews, collectionAnalysis, productsColl) {
  let productObjectId;
  try {
    productObjectId = new ObjectId(productIdStr);
  } catch {
    return null;
  }

  // 1. Fetch current reviews
  const reviews = await collectionReviews
    .find({ productId: productObjectId })
    .sort({ createdAt: -1 })
    .toArray();

  // 2. Fetch product info
  let productInfo = {};
  if (productsColl) {
    const product = await productsColl.findOne({ _id: productObjectId });
    if (product) {
      productInfo = {
        name: product.name,
        company: product.company,
        category: product.category,
      };
    }
  }

  // 3. Generate analysis (AI or NLP fallback)
  const analysisResult = await generateReviewAnalysis(reviews, productInfo);

  // 4. Save to review_analysis collection
  const analysisDoc = {
    productId: productObjectId,
    ...analysisResult,
    updatedAt: new Date(),
  };

  await collectionAnalysis.updateOne(
    { productId: productObjectId },
    { $set: analysisDoc },
    { upsert: true }
  );

  return analysisDoc;
}

/**
 * GET /products/:productId/reviews
 * Fetch all customer reviews for a given product
 */
async function getReviews(req, res) {
  try {
    const { productId } = req.params;
    if (!productId || !ObjectId.isValid(productId)) {
      return res.status(400).json({ err: true, msg: 'Invalid product ID' });
    }

    const collection = await db.connectReviewsDb();
    const reviews = await collection
      .find({ productId: new ObjectId(productId) })
      .sort({ createdAt: -1 })
      .toArray();

    const totalReviews = reviews.length;
    let averageRating = 0;
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
      averageRating = Number((sum / totalReviews).toFixed(1));
    }

    return res.status(200).json({
      err: false,
      reviews,
      totalReviews,
      averageRating,
    });
  } catch (error) {
    console.error('Error in getReviews:', error);
    return res.status(500).json({ err: true, msg: 'Failed to fetch reviews', error: error.message });
  }
}

/**
 * POST /products/:productId/reviews
 * Add a new customer review and auto-refresh analysis
 */
async function addReview(req, res) {
  try {
    const { productId } = req.params;
    const { rating, comment, title, userName, userId, verifiedPurchase } = req.body;

    if (!productId || !ObjectId.isValid(productId)) {
      return res.status(400).json({ err: true, msg: 'Invalid product ID' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ err: true, msg: 'Rating must be between 1 and 5' });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({ err: true, msg: 'Review comment is required' });
    }

    const finalUserName = (userName && userName.trim()) || 'Anonymous Customer';

    const newReview = {
      productId: new ObjectId(productId),
      userId: userId || null,
      userName: finalUserName,
      rating: numRating,
      title: (title || '').trim(),
      comment: comment.trim(),
      verifiedPurchase: Boolean(verifiedPurchase),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collectionReviews = await db.connectReviewsDb();
    const insertResult = await collectionReviews.insertOne(newReview);
    newReview._id = insertResult.insertedId;

    // Automatically update the AI review analysis in the background
    const collectionAnalysis = await db.connectReviewAnalysisDb();
    const productsColl = await db.connectProductsDb();
    computeAndSaveAnalysis(productId, collectionReviews, collectionAnalysis, productsColl).catch(err => {
      console.warn('Background review analysis update error:', err.message);
    });

    return res.status(201).json({
      err: false,
      msg: 'Review submitted successfully!',
      review: newReview,
    });
  } catch (error) {
    console.error('Error in addReview:', error);
    return res.status(500).json({ err: true, msg: 'Failed to submit review', error: error.message });
  }
}

/**
 * DELETE /products/:productId/reviews/:reviewId
 * Remove a review and update cached analysis
 */
async function deleteReview(req, res) {
  try {
    const { productId, reviewId } = req.params;

    if (!productId || !ObjectId.isValid(productId) || !reviewId || !ObjectId.isValid(reviewId)) {
      return res.status(400).json({ err: true, msg: 'Invalid product or review ID' });
    }

    const collectionReviews = await db.connectReviewsDb();
    const deleteResult = await collectionReviews.deleteOne({
      _id: new ObjectId(reviewId),
      productId: new ObjectId(productId),
    });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ err: true, msg: 'Review not found' });
    }

    // Refresh analysis after review deletion
    const collectionAnalysis = await db.connectReviewAnalysisDb();
    const productsColl = await db.connectProductsDb();
    computeAndSaveAnalysis(productId, collectionReviews, collectionAnalysis, productsColl).catch(err => {
      console.warn('Background review analysis update error:', err.message);
    });

    return res.status(200).json({
      err: false,
      msg: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteReview:', error);
    return res.status(500).json({ err: true, msg: 'Failed to delete review', error: error.message });
  }
}

/**
 * GET /products/:productId/review-analysis
 * Fetch or generate cached AI Review Analysis
 */
async function getReviewAnalysis(req, res) {
  try {
    const { productId } = req.params;
    if (!productId || !ObjectId.isValid(productId)) {
      return res.status(400).json({ err: true, msg: 'Invalid product ID' });
    }

    const collectionReviews = await db.connectReviewsDb();
    const collectionAnalysis = await db.connectReviewAnalysisDb();
    const productsColl = await db.connectProductsDb();

    // 1. Count current reviews
    const currentReviewCount = await collectionReviews.countDocuments({
      productId: new ObjectId(productId),
    });

    // 2. Check cached analysis
    const cachedAnalysis = await collectionAnalysis.findOne({
      productId: new ObjectId(productId),
    });

    // 3. Return cached analysis if review count matches and it exists
    if (cachedAnalysis && cachedAnalysis.analyzedReviewCount === currentReviewCount) {
      return res.status(200).json({
        err: false,
        analysis: cachedAnalysis,
        fromCache: true,
      });
    }

    // 4. Stale or missing: compute fresh analysis and cache
    const freshAnalysis = await computeAndSaveAnalysis(
      productId,
      collectionReviews,
      collectionAnalysis,
      productsColl
    );

    return res.status(200).json({
      err: false,
      analysis: freshAnalysis,
      fromCache: false,
    });
  } catch (error) {
    console.error('Error in getReviewAnalysis:', error);
    return res.status(500).json({
      err: true,
      msg: 'Failed to retrieve review analysis',
      error: error.message,
    });
  }
}

/**
 * POST /products/:productId/review-analysis/refresh
 * Force regenerate AI Review Analysis regardless of cache
 */
async function refreshReviewAnalysis(req, res) {
  try {
    const { productId } = req.params;
    if (!productId || !ObjectId.isValid(productId)) {
      return res.status(400).json({ err: true, msg: 'Invalid product ID' });
    }

    const collectionReviews = await db.connectReviewsDb();
    const collectionAnalysis = await db.connectReviewAnalysisDb();
    const productsColl = await db.connectProductsDb();

    const freshAnalysis = await computeAndSaveAnalysis(
      productId,
      collectionReviews,
      collectionAnalysis,
      productsColl
    );

    return res.status(200).json({
      err: false,
      msg: 'Review analysis refreshed successfully',
      analysis: freshAnalysis,
      fromCache: false,
      refreshed: true,
    });
  } catch (error) {
    console.error('Error in refreshReviewAnalysis:', error);
    return res.status(500).json({
      err: true,
      msg: 'Failed to refresh review analysis',
      error: error.message,
    });
  }
}

module.exports = {
  getReviews,
  addReview,
  deleteReview,
  getReviewAnalysis,
  refreshReviewAnalysis,
  computeAndSaveAnalysis,
};
