const express = require('express');
const router = express.Router();
const marketPriceController = require('../controllers/marketPrice.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', marketPriceController.getAllPrices);
router.get('/trending', marketPriceController.getTrendingPrices);
router.get('/:id', marketPriceController.getPriceById);
router.post('/', protect, marketPriceController.createPrice);
router.put('/:id', protect, marketPriceController.updatePrice);
router.delete('/:id', protect, marketPriceController.deletePrice);

module.exports = router;
