const { Chat } = require('../models/Chat.model');
const { emitNewMessage, emitNegotiationUpdate } = require('../utils/socket');

// Get all chats for current user
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'name email role avatar')
      .sort({ lastMessageAt: -1 });
    
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get single chat with messages
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email role avatar')
      .populate('messages.sender', 'name role avatar');
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    // Check if user is participant
    if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Mark messages as read
    chat.messages.forEach(msg => {
      if (msg.sender._id.toString() !== req.user.id && !msg.read) {
        msg.read = true;
        msg.readAt = new Date();
      }
    });
    
    await chat.save();
    
    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Send text message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    // Check if user is participant
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const message = {
      sender: req.user.id,
      content,
      messageType: 'text',
      read: false
    };
    
    chat.messages.push(message);
    chat.lastMessage = content;
    chat.lastMessageAt = new Date();
    
    await chat.save();
    await chat.populate('messages.sender', 'name role avatar');
    
    const newMessage = chat.messages[chat.messages.length - 1];
    
    // Emit socket event using utility
    emitNewMessage(chatId, {
      chatId,
      message: newMessage
    });
    
    res.json({ success: true, message: 'Message sent', chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Send negotiation offer
exports.sendNegotiation = async (req, res) => {
  try {
    const { chatId, productId, productName, originalPrice, proposedPrice, quantity } = req.body;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    const message = {
      sender: req.user.id,
      content: `Negotiation offer for ${productName}`,
      messageType: 'negotiation',
      negotiation: {
        productId,
        productName,
        originalPrice,
        proposedPrice,
        quantity,
        status: 'pending'
      },
      read: false
    };
    
    chat.messages.push(message);
    chat.lastMessage = `Negotiation: ${productName}`;
    chat.lastMessageAt = new Date();
    chat.chatType = 'negotiation';
    
    await chat.save();
    await chat.populate('messages.sender', 'name role avatar');
    
    const newMessage = chat.messages[chat.messages.length - 1];
    
    // Emit socket event using utility
    emitNewMessage(chatId, {
      chatId,
      message: newMessage,
      type: 'negotiation'
    });
    
    res.json({ success: true, message: 'Negotiation sent', chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Respond to negotiation
exports.respondNegotiation = async (req, res) => {
  try {
    const { chatId, messageId, status, counterPrice } = req.body;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    message.negotiation.status = status;
    if (counterPrice) {
      message.negotiation.counterPrice = counterPrice;
    }
    
    // Add response message
    let responseContent = '';
    if (status === 'accepted') {
      responseContent = `Accepted negotiation for ${message.negotiation.productName} at ₹${message.negotiation.proposedPrice}`;
    } else if (status === 'rejected') {
      responseContent = `Rejected negotiation for ${message.negotiation.productName}`;
    } else if (status === 'counter') {
      responseContent = `Counter offer for ${message.negotiation.productName} at ₹${counterPrice}`;
    }
    
    chat.messages.push({
      sender: req.user.id,
      content: responseContent,
      messageType: 'text',
      read: false
    });
    
    chat.lastMessage = responseContent;
    chat.lastMessageAt = new Date();
    
    await chat.save();
    await chat.populate('messages.sender', 'name role avatar');
    
    // Emit socket event using utility
    emitNegotiationUpdate(chatId, {
      chatId,
      messageId,
      status,
      counterPrice,
      message: chat.messages[chat.messages.length - 1]
    });
    
    res.json({ success: true, message: 'Response sent', chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create or get existing chat
exports.createChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    
    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] }
    }).populate('participants', 'name email role avatar');
    
    if (!chat) {
      chat = await Chat.create({
        participants: [req.user.id, participantId],
        messages: [],
        lastMessageAt: new Date()
      });
      
      await chat.populate('participants', 'name email role avatar');
    }
    
    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete chat
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    // Check if user is participant
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await Chat.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
