// const express = require('express');
// const router = express.Router();
// const productService = require('./services/product.service');

// router.post('/addProduct', productService.addProduct);
// router.get('/getProductList',productService.getProductList);
// router.get('deleteProduct', productService.deleteProduct);

// module.exports = router;

const express = require('express');
const router = express.Router();
const productService = require('./services/product.service');
const reviewService = require('./services/review.service');

router.post('/addProduct', productService.addProduct);
router.put('/updateProduct/:id', productService.updateProduct);
router.get('/getProductList', productService.getProductList);
router.get('/semantic-search', productService.semanticSearch);
router.get('/getProduct/:id', productService.getProductById);
router.delete('/deleteProduct/:id', productService.deleteProduct);
router.post('/editProduct', productService.editProduct);
router.post('/addProductToCart', productService.addProductToCart);
router.get('/getAddedItems/:userId', productService.getAddedItems);
router.post('/removeAddedItems', productService.removeAddedItems);
router.post('/IncreaseDecreaseItems', productService.IncreaseDecreaseItems);
router.query('/getAllProductList', productService.getAllProductList);
router.delete('/deleteProduct/:id', productService.deleteProduct);
router.post('/placeOrder', productService.placeOrder);

// Review & Sentiment Analysis Routes
router.get('/:productId/reviews', reviewService.getReviews);
router.post('/:productId/reviews', reviewService.addReview);
router.delete('/:productId/reviews/:reviewId', reviewService.deleteReview);
router.get('/:productId/review-analysis', reviewService.getReviewAnalysis);
router.post('/:productId/review-analysis/refresh', reviewService.refreshReviewAnalysis);

module.exports = router;
