const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Add product to wishlist
router.post('/add', wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/remove/:productId', wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/clear', wishlistController.clearWishlist);

// Move product to cart
router.post('/move-to-cart', wishlistController.moveToCart);

module.exports = router;
