const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// Chat routes
router.get('/', protect, chatController.getChats);
router.post('/', protect, chatController.createChat);
router.get('/:id', protect, chatController.getChatById);
router.delete('/:id', protect, chatController.deleteChat);

// Message routes
router.post('/message', protect, chatController.sendMessage);
router.post('/negotiation', protect, chatController.sendNegotiation);
router.post('/negotiation/respond', protect, chatController.respondNegotiation);

module.exports = router;
