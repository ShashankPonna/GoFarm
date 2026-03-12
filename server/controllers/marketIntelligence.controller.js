const { computeMarketIntelligence } = require('../utils/marketIntelligence');
const MarketPriceHistory = require('../models/MarketPriceHistory.model');

// GET /api/market/intelligence?crop=Onion&state=Maharashtra&district=Nashik
exports.getMarketIntelligence = async (req, res) => {
    try {
        const { crop, state, district } = req.query;

        if (!crop) {
            return res.status(400).json({
                success: false,
                message: 'Crop name is required. Usage: ?crop=Onion&state=Maharashtra&district=Nashik'
            });
        }

        const intelligence = await computeMarketIntelligence(crop, state, district);

        if (!intelligence) {
            return res.status(404).json({
                success: false,
                message: `No price data found for "${crop}". Try fetching latest data first or check crop name.`
            });
        }

        res.json({ success: true, data: intelligence });
    } catch (error) {
        console.error('❌ Market Intelligence Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to compute market intelligence',
            error: error.message
        });
    }
};

// GET /api/market/crops — list available crops in the database
exports.getAvailableCrops = async (req, res) => {
    try {
        const crops = await MarketPriceHistory.distinct('cropName');
        const states = await MarketPriceHistory.distinct('state');

        res.json({ success: true, crops, states });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// GET /api/market/districts?state=Maharashtra — list districts for a state
exports.getDistricts = async (req, res) => {
    try {
        const { state } = req.query;
        const query = state ? { state: { $regex: new RegExp(state, 'i') } } : {};
        const districts = await MarketPriceHistory.distinct('district', query);

        res.json({ success: true, districts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// POST /api/market/fetch — manually trigger data fetch from Agmarknet
exports.fetchLatestPrices = async (req, res) => {
    try {
        const { fetchAndStorePrices, loadSampleData } = require('../utils/mandiCronJob');
        let result = await fetchAndStorePrices();
        
        // If API fetch fails or returns no data, load sample data
        if (!result.success || result.saved === 0) {
            result = await loadSampleData();
        }
        
        res.json({ success: true, message: 'Fetch completed', ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetch failed', error: error.message });
    }
};
