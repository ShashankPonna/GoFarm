const mongoose = require('mongoose');

/**
 * Atomic counter for generating unique Dispute IDs (DSP-0001, DSP-0002, ...)
 * Uses MongoDB findOneAndUpdate with $inc for concurrency safety.
 */
const disputeCounterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: 'disputeID'
    },
    seq: {
        type: Number,
        default: 0
    }
});

/**
 * Get next dispute ID atomically.
 * @returns {Promise<string>} e.g. "DSP-0001"
 */
disputeCounterSchema.statics.getNextID = async function () {
    const counter = await this.findOneAndUpdate(
        { _id: 'disputeID' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return `DSP-${String(counter.seq).padStart(4, '0')}`;
};

module.exports = mongoose.model('DisputeCounter', disputeCounterSchema);
