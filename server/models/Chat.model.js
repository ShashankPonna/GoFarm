const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'negotiation', 'image', 'file'],
    default: 'text'
  },
  negotiation: {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    originalPrice: Number,
    proposedPrice: Number,
    quantity: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'counter'],
      default: 'pending'
    },
    counterPrice: Number
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  lastMessage: {
    type: String
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  chatType: {
    type: String,
    enum: ['direct', 'negotiation', 'support'],
    default: 'direct'
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = { Chat };
