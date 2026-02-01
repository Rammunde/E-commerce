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
router.post('/removeAddedItems', productService.removeAddedItems);
router.post('/IncreaseDecreaseItems', productService.IncreaseDecreaseItems);
router.post('/getAllProductList', productService.getAllProductList);
router.delete('/deleteProduct/:id', productService.deleteProduct);


module.exports = router;
