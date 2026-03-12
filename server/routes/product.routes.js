const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadProductFiles } = require('../config/multer.config');

router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProduct);

router.use(protect); // All routes below require authentication

router.post('/', authorize('farmer', 'retailer'), uploadProductFiles, productController.createProduct);
router.put('/:id', authorize('farmer', 'retailer'), uploadProductFiles, productController.updateProduct);
router.delete('/:id', authorize('farmer', 'retailer'), productController.deleteProduct);
router.post('/:id/review', productController.addReview);

module.exports = router;
