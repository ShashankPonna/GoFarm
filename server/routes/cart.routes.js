const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, cartController.getCart);
router.post('/add', protect, cartController.addToCart);
router.put('/update', protect, cartController.updateCartItem);
router.delete('/remove/:productId', protect, cartController.removeFromCart);
router.delete('/clear', protect, cartController.clearCart);

module.exports = router;
