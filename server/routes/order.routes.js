const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, orderController.createOrder);
router.get('/', protect, orderController.getOrders);
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id/status', protect, orderController.updateOrderStatus);

module.exports = router;
