const mongoose = require('mongoose');

const wasteProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Organic', 'Mulch', 'Fertilizer', 'Other'],
    default: 'Other'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'ton', 'bag', 'quintal'],
    default: 'kg'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  images: [{
    url: String,
    filename: String
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
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WasteProduct', wasteProductSchema);
