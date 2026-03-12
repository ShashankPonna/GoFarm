const mongoose = require('mongoose');

/**
 * Exchange Request Schema
 * Tracks barter/value exchanges between two users (farmer ↔ farmer, farmer ↔ retailer).
 */
const exchangeRequestSchema = new mongoose.Schema({
    // Unique exchange ID (EXCH-0001 format)
    exchangeID: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Requester (who initiates)
    requesterCustomID: {
        type: String,
        required: [true, 'Requester ID is required'],
        index: true
    },

    // Receiver (who gets the request)
    receiverCustomID: {
        type: String,
        required: [true, 'Receiver ID is required'],
        index: true
    },

    // What the requester offers
    offeredItem: {
        type: String,
        required: [true, 'Offered item is required'],
        trim: true
    },
    offeredQuantity: {
        type: Number,
        required: [true, 'Offered quantity is required'],
        min: [0.1, 'Quantity must be positive']
    },

    // What the requester wants in return
    requestedItem: {
        type: String,
        required: [true, 'Requested item is required'],
        trim: true
    },
    requestedQuantity: {
        type: Number,
        required: [true, 'Requested quantity is required'],
        min: [0.1, 'Quantity must be positive']
    },

    // Calculated values from MarketPrice
    calculatedOfferedValue: {
        type: Number,
        default: 0
    },
    calculatedRequestedValue: {
        type: Number,
        default: 0
    },
    valueDifference: {
        type: Number,
        default: 0
    },

    // Exchange status
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending',
        index: true
    },

    // Dual-confirm completion
    requesterConfirmed: {
        type: Boolean,
        default: false
    },
    receiverConfirmed: {
        type: Boolean,
        default: false
    },

    completedAt: {
        type: Date,
        default: null
    },

    // Payment
    paymentMethod: {
        type: String,
        enum: ['online', 'cod', 'none'],
        default: 'none'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'not_required'],
        default: 'not_required'
    },
    paidAt: {
        type: Date,
        default: null
    },

    // Cached contact info (populated on creation for quick access)
    requesterName: { type: String, default: '' },
    requesterPhone: { type: String, default: '' },
    receiverName: { type: String, default: '' },
    receiverPhone: { type: String, default: '' }
}, {
    timestamps: true // createdAt, updatedAt
});

// Compound index: prevent duplicate active exchanges between same pair
exchangeRequestSchema.index(
    { requesterCustomID: 1, receiverCustomID: 1, status: 1 }
);

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
