/**
 * AI Chatbot Controller
 * Uses Groq AI for intelligent farming assistant responses
 */

const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are GoFarm AI Assistant, a knowledgeable agricultural expert chatbot. You help Indian farmers with:
- Crop recommendations based on season, soil, and climate
- Pest and disease identification and treatment
- Fertilizer recommendations (both chemical and organic)
- Current market prices and trends for agricultural products
- Government schemes and subsidies for farmers (PM-KISAN, crop insurance, KCC etc.)
- Weather-based farming advice
- Organic farming techniques
- Irrigation and water management
- Post-harvest storage and processing tips

Guidelines:
- Be friendly, supportive and encouraging to farmers
- Give practical, actionable advice
- Use emojis to make responses engaging (🌾 🌱 💰 🛡️ etc.)
- Keep responses concise but informative (2-4 paragraphs max)
- When discussing prices, use Indian Rupees (₹)
- Mention relevant government helplines when appropriate
- If you don't know something, suggest consulting local Krishi Vigyan Kendra or agriculture extension officer
- Format responses with bullet points and bold text for readability using markdown`;

// @desc    Send message to AI chatbot
// @route   POST /api/chatbot/message
// @access  Public (or Private if auth is needed)
exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    if (!GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not configured');
      return res.status(500).json({
        success: false,
        message: 'AI service is not configured. Please set GROQ_API_KEY in environment variables.'
      });
    }

    console.log(`🤖 [Chatbot] User message: "${message.substring(0, 80)}..."`);

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const response = await axios.post(GROQ_API_URL, {
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const aiResponse = response.data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI model');
    }

    console.log(`✅ [Chatbot] AI responded (${aiResponse.length} chars)`);

    res.json({
      success: true,
      response: aiResponse
    });

  } catch (error) {
    console.error('❌ [Chatbot] Error:', error.response?.data || error.message);

    // Provide a helpful fallback response
    res.status(500).json({
      success: false,
      message: 'AI service temporarily unavailable',
      fallbackResponse: '🤖 I\'m having trouble connecting to my AI brain right now. Please try again in a moment, or feel free to ask about:\n\n• 🌾 Crop recommendations\n• 🛡️ Pest & disease control\n• 🧪 Fertilizer advice\n• 💰 Market prices\n• 🏛️ Government schemes'
    });
  }
};
