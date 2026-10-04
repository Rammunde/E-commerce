const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewService = require('./services/review.service');

// Review & Sentiment Analysis Routes
router.get('/:productId/reviews', reviewService.getReviews);
router.post('/:productId/reviews', reviewService.addReview);
router.delete('/:productId/reviews/:reviewId', reviewService.deleteReview);
router.get('/:productId/review-analysis', reviewService.getReviewAnalysis);
router.post('/:productId/review-analysis/refresh', reviewService.refreshReviewAnalysis);

module.exports = router;
