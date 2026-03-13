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
// GET /api/market/proxy — proxy requests to Agmarknet to avoid CORS
exports.proxyAgmarknet = async (req, res) => {
    try {
        const axios = require('axios');
        const envApiKey = process.env.DATA_GOV_API_KEY;
        const providedApiKey = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
        // Prioritize provided key for this feature
        const apiKey = providedApiKey || envApiKey;
        
        const RESOURCE_ID = '35985678-0d79-46b4-9ed6-6f13308a1d24';
        const BASE_API_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

        // Ensure filters use capitalized keys if not already
        const queryParams = { ...req.query };
        if (queryParams['filters[state]']) {
            queryParams['filters[State]'] = queryParams['filters[state]'];
            delete queryParams['filters[state]'];
        }
        if (queryParams['filters[district]']) {
            queryParams['filters[District]'] = queryParams['filters[district]'];
            delete queryParams['filters[district]'];
        }
        if (queryParams['filters[commodity]']) {
            queryParams['filters[Commodity]'] = queryParams['filters[commodity]'];
            delete queryParams['filters[commodity]'];
        }

        const params = {
            'api-key': apiKey,
            format: 'json',
            limit: req.query.limit || 50,
            ...queryParams
        };

        console.log(`📡 Proxying to Agmarknet: ${BASE_API_URL}`);
        console.log(`🔍 Filters:`, JSON.stringify(queryParams));

        const response = await axios.get(BASE_API_URL, { params, timeout: 20000 });
        
        const recordCount = response.data?.records?.length || 0;
        console.log(`✅ Received ${recordCount} records from Agmarknet`);

        res.json(response.data);
    } catch (error) {
        console.error('❌ Agmarknet Proxy Error:', error.message);
        
        // --- FALLBACK LOGIC: Query local database if API fails ---
        try {
            console.log('🔄 Attempting to use local fallback data...');
            const query = {};
            if (queryParams['filters[State]']) {
                query.state = new RegExp(`^${queryParams['filters[State]']}$`, 'i');
            }
            if (queryParams['filters[District]']) {
                query.district = new RegExp(`^${queryParams['filters[District]']}$`, 'i');
            }
            if (queryParams['filters[Commodity]']) {
                query.cropName = new RegExp(`^${queryParams['filters[Commodity]']}$`, 'i');
            }

            const localData = await MarketPriceHistory.find(query).sort({ date: -1 }).limit(100);
            
            if (localData && localData.length > 0) {
                console.log(`✅ Loaded ${localData.length} fallback records from MongoDB`);
                const mappedRecords = localData.map(item => ({
                    state: item.state,
                    district: item.district,
                    commodity: item.cropName,
                    market: item.mandiName,
                    modal_price: item.price,
                    min_price: item.minPrice,
                    max_price: item.maxPrice,
                    arrival_date: item.date
                }));
                // Return fallback data looking like Agmarknet data
                return res.json({ records: mappedRecords, fallback: true });
            }
        } catch (dbError) {
            console.error('❌ Fallback DB Error:', dbError.message);
        }
        // -----------------------

        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data));
            
            // Forward 429 properly if fallback fails
            if (error.response.status === 429) {
                return res.status(429).json({
                    success: false,
                    message: 'API rate limit reached (429).',
                    error: 'Rate limit exceeded'
                });
            }
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch data from Agmarknet',
            error: error.message 
        });
    }
};
