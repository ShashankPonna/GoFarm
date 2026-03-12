const express = require('express');
const router = express.Router();
const cropController = require('../controllers/crop.controller');
const { protect } = require('../middleware/auth.middleware');

// Special routes MUST come before parameter-based routes
// Crop Recommendation Routes
router.post('/recommendations/full', cropController.getRecommendations);
router.post('/recommendations/quick', cropController.quickRecommend);

// Groq AI Routes
router.post('/groq-advice/:cropName', cropController.getCropAdvice);
router.post('/soil-improvement', cropController.getSoilPlan);

// Standard CRUD routes (parameter-based)
router.post('/', protect, cropController.createCrop);
router.get('/', cropController.getCrops);
router.get('/:id', cropController.getCropById);
router.put('/:id', protect, cropController.updateCrop);
router.delete('/:id', protect, cropController.deleteCrop);

module.exports = router;
