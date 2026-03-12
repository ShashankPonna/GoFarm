const mongoose = require('mongoose');

const farmWorkPostSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop'
    },
    cropName: {
        type: String,
        required: [true, 'Crop name is required'],
        trim: true
    },
    farmSize: {
        type: String,
        required: [true, 'Farm size is required'],
        trim: true
    },
    workType: {
        type: String,
        required: [true, 'Work type is required'],
        trim: true
    },
    totalWorkDays: {
        type: Number,
        required: [true, 'Total work days is required'],
        min: 1
    },
    workingHoursPerDay: {
        type: String,
        required: [true, 'Working hours is required'],
        trim: true
    },
    paymentType: {
        type: String,
        enum: ['Hourly', 'Daily'],
        required: [true, 'Payment type is required']
    },
    paymentAmount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: 0
    },
    labourNeeded: {
        type: Number,
        required: [true, 'Labour needed count is required'],
        min: 1
    },
    labourApplied: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    location: {
        state: { type: String, trim: true, default: '' },
        district: { type: String, trim: true, default: '' },
        taluka: { type: String, trim: true, default: '' },
        village: { type: String, trim: true, default: '' }
    },
    applicants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        contact: { type: String, default: '' },
        village: { type: String, default: '' },
        appliedAt: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Open'
    }
}, {
    timestamps: true
});

// Indexes for fast nearby queries
farmWorkPostSchema.index({ 'location.district': 1, status: 1 });
farmWorkPostSchema.index({ postedBy: 1, createdAt: -1 });

module.exports = mongoose.model('FarmWorkPost', farmWorkPostSchema);
