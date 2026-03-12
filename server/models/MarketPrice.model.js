const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Others']
  },
  currentPrice: {
    type: Number,
    required: true
  },
  previousPrice: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: 'kg',
    enum: ['kg', 'quintal', 'ton', 'piece', 'dozen', 'liter']
  },
  market: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  priceChange: {
    type: Number,
    default: 0
  },
  priceChangePercent: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate price change before saving
marketPriceSchema.pre('save', function(next) {
  if (this.previousPrice > 0) {
    this.priceChange = this.currentPrice - this.previousPrice;
    this.priceChangePercent = ((this.priceChange / this.previousPrice) * 100).toFixed(2);
  }
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
