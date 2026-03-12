const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');

// POST /api/chatbot/message - Send message to AI chatbot
router.post('/message', chatbotController.sendMessage);

module.exports = router;
