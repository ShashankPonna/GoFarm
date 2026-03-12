const express = require('express');
const router = express.Router();
const marketIntelligenceController = require('../controllers/marketIntelligence.controller');

// GET /api/market/intelligence?crop=Onion&state=Maharashtra&district=Nashik
router.get('/intelligence', marketIntelligenceController.getMarketIntelligence);

// GET /api/market/crops — list available crops
router.get('/crops', marketIntelligenceController.getAvailableCrops);

// GET /api/market/districts?state=Maharashtra — list districts
router.get('/districts', marketIntelligenceController.getDistricts);

// POST /api/market/fetch — manually trigger data fetch from Agmarknet
router.post('/fetch', marketIntelligenceController.fetchLatestPrices);

module.exports = router;
