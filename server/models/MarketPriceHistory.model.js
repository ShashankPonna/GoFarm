const mongoose = require('mongoose');

const marketPriceHistorySchema = new mongoose.Schema({
    cropName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    state: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    district: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    mandiName: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    minPrice: {
        type: Number,
        default: 0
    },
    maxPrice: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
marketPriceHistorySchema.index({ cropName: 1, district: 1, date: -1 });
marketPriceHistorySchema.index({ cropName: 1, state: 1, date: -1 });

module.exports = mongoose.model('MarketPriceHistory', marketPriceHistorySchema);
