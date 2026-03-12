const mongoose = require('mongoose');

/**
 * Atomic counter for generating sequential Exchange IDs (EXCH-0001, EXCH-0002, ...)
 * Uses MongoDB findOneAndUpdate with $inc to guarantee uniqueness under concurrency.
 */
const exchangeCounterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: 'exchangeID'
    },
    seq: {
        type: Number,
        default: 0
    }
});

/**
 * Get next exchange ID atomically.
 * @returns {Promise<string>} e.g. "EXCH-0001"
 */
exchangeCounterSchema.statics.getNextID = async function () {
    const counter = await this.findOneAndUpdate(
        { _id: 'exchangeID' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return `EXCH-${String(counter.seq).padStart(4, '0')}`;
};

module.exports = mongoose.model('ExchangeCounter', exchangeCounterSchema);
