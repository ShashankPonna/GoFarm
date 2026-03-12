const MarketPrice = require('../models/MarketPrice.model');

// Get all market prices
exports.getAllPrices = async (req, res) => {
  try {
    const { category, state, district, search } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (state) query.state = state;
    if (district) query.district = district;
    if (search) {
      query.productName = { $regex: search, $options: 'i' };
    }
    
    const prices = await MarketPrice.find(query).sort({ lastUpdated: -1 });
    
    res.json({ success: true, prices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get price by ID
exports.getPriceById = async (req, res) => {
  try {
    const price = await MarketPrice.findById(req.params.id);
    
    if (!price) {
      return res.status(404).json({ success: false, message: 'Price data not found' });
    }
    
    res.json({ success: true, price });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create market price
exports.createPrice = async (req, res) => {
  try {
    const price = await MarketPrice.create(req.body);
    res.status(201).json({ success: true, message: 'Price data created successfully', price });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update market price
exports.updatePrice = async (req, res) => {
  try {
    const existingPrice = await MarketPrice.findById(req.params.id);
    
    if (!existingPrice) {
      return res.status(404).json({ success: false, message: 'Price data not found' });
    }
    
    // Store previous price before updating
    if (req.body.currentPrice && req.body.currentPrice !== existingPrice.currentPrice) {
      req.body.previousPrice = existingPrice.currentPrice;
    }
    
    const price = await MarketPrice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, message: 'Price updated successfully', price });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete market price
exports.deletePrice = async (req, res) => {
  try {
    const price = await MarketPrice.findByIdAndDelete(req.params.id);
    
    if (!price) {
      return res.status(404).json({ success: false, message: 'Price data not found' });
    }
    
    res.json({ success: true, message: 'Price data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get trending prices (most changed)
exports.getTrendingPrices = async (req, res) => {
  try {
    const prices = await MarketPrice.find()
      .sort({ priceChangePercent: -1 })
      .limit(10);
    
    res.json({ success: true, prices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
