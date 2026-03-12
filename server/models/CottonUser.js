const mongoose = require('mongoose');

const cottonUserSchema = new mongoose.Schema({
  firebase_uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  farm_size: {
    type: Number,
    default: null,
    description: 'Farm size in acres'
  },
  profile_picture_url: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date,
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'cotton_users'
});

// Update last_login on every login
cottonUserSchema.methods.updateLastLogin = function() {
  this.last_login = new Date();
  return this.save();
};

module.exports = mongoose.model('CottonUser', cottonUserSchema);
