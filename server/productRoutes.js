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

router.post('/addProduct', productService.addProduct);
router.get('/getProductList', productService.getProductList);
router.delete('/deleteProduct/:id', productService.deleteProduct);
router.post('/editProduct', productService.editProduct);
router.post('/addProductToCart', productService.addProductToCart);
router.get('/getAddedItems/:userId', productService.getAddedItems);

module.exports = router;
