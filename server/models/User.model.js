const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['farmer', 'retailer'],
    required: true
  },
  customID: {
    type: String,
    required: true,
    unique: true
  },

  // Location fields
  location: {
    district: { type: String, required: true },
    taluka: { type: String, required: true },
    village: { type: String, required: true },
    pincode: { type: String, required: true }
  },

  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Index for fast lookups
userSchema.index({ customID: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ firebaseUID: 1 });

module.exports = mongoose.model('User', userSchema);
