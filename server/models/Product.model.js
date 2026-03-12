const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'millets', 'cereals', 'pulses', 'spices', 'dairy', 'edible-oil', 'waste', 'other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'quintal', 'ton', 'liter', 'piece', 'dozen'],
    default: 'kg'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    url: String,
    publicId: String
  }],
  videos: [{
    url: String,
    filename: String
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organic: {
    type: Boolean,
    default: false
  },
  certified: {
    type: Boolean,
    default: false
  },
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['available', 'out-of-stock', 'discontinued'],
    default: 'available'
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
