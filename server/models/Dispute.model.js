const mongoose = require('mongoose');

/**
 * Dispute Schema
 * Tracks complaints raised against exchanges between users.
 */
const disputeSchema = new mongoose.Schema({
    // Unique dispute ID (DSP-0001 format)
    disputeID: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Linked exchange
    exchangeID: {
        type: String,
        required: [true, 'Exchange ID is required'],
        index: true
    },

    // Who raised the complaint
    raisedByCustomID: {
        type: String,
        required: [true, 'Raiser ID is required'],
        index: true
    },

    // Against whom
    againstCustomID: {
        type: String,
        required: [true, 'Against ID is required'],
        index: true
    },

    // Complaint details
    reason: {
        type: String,
        required: [true, 'Reason is required'],
        enum: [
            'item_not_received',
            'wrong_item',
            'quality_issue',
            'quantity_mismatch',
            'fraud',
            'other'
        ]
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [2000, 'Description too long']
    },

    // Evidence files (uploaded via multer)
    evidenceFiles: [{
        url: String,
        originalName: String,
        fileType: String
    }],

    // Status tracking
    status: {
        type: String,
        enum: ['open', 'under_review', 'resolved', 'rejected'],
        default: 'open',
        index: true
    },

    // Admin resolution fields
    adminDecision: {
        type: String,
        default: ''
    },
    trustPenalty: {
        type: Number,
        default: 0,
        min: 0,
        max: 20
    },
    resolvedAt: {
        type: Date,
        default: null
    },

    // Cached names for quick display
    raisedByName: { type: String, default: '' },
    againstName: { type: String, default: '' }
}, {
    timestamps: true
});

// Compound index: prevent duplicate open disputes for same exchange by same user
disputeSchema.index(
    { exchangeID: 1, raisedByCustomID: 1, status: 1 }
);

module.exports = mongoose.model('Dispute', disputeSchema);
