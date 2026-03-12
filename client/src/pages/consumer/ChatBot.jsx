import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const ChatBot = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      text: t('consumerChatbot.welcomeMessage'),
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    { text: t('consumerChatbot.availableProducts'), icon: '🛍️', category: 'products' },
    { text: t('consumerChatbot.howToOrder'), icon: '📱', category: 'order' },
    { text: t('consumerChatbot.deliveryOptions'), icon: '🚚', category: 'delivery' },
    { text: t('consumerChatbot.freshProduce'), icon: '🥬', category: 'fresh' },
    { text: t('consumerChatbot.paymentMethods'), icon: '💳', category: 'payment' },
    { text: t('consumerChatbot.returnPolicy'), icon: '↩️', category: 'return' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const userMessage = { 
        type: 'user', 
        text: inputMessage, 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      
      setTimeout(() => {
        const botResponse = getBotResponse(inputMessage);
        const botMessage = { 
          type: 'bot', 
          text: botResponse, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1500 + Math.random() * 1000);
    }
  };

  const getBotResponse = (message) => {
    const responses = {
      'product': '🛍️ **Available Products:**\n\n🥬 **Fresh Vegetables:**\n• Tomatoes, Potatoes, Onions\n• Leafy greens, Carrots, Beans\n• Seasonal vegetables\n\n🍎 **Fresh Fruits:**\n• Apples, Bananas, Oranges\n• Seasonal fruits, Berries\n• Organic options available\n\n🌾 **Grains & Pulses:**\n• Rice, Wheat, Millets\n• Lentils, Chickpeas, Beans\n\nAll sourced directly from local farmers!',
      
      'order': '📱 **How to Place an Order:**\n\n✅ **Step by Step:**\n1️⃣ Browse our product catalog\n2️⃣ Add items to your cart\n3️⃣ Review cart & proceed to checkout\n4️⃣ Enter delivery address\n5️⃣ Choose payment method\n6️⃣ Confirm your order\n\n📧 You\'ll receive order confirmation via SMS & email\n📱 Track your order in real-time',
      
      'delivery': '🚚 **Delivery Information:**\n\n🆓 **Free Delivery:**\n• Orders above ₹500\n• Standard delivery: 1-2 days\n\n⚡ **Express Delivery:**\n• Same day delivery: ₹50 extra\n• Available in select areas\n• Order before 12 PM\n\n📍 **Delivery Areas:**\n• City-wide coverage\n• Rural areas: 2-3 days\n• Fresh produce guaranteed',
      
      'fresh': '🥬 **Freshness Guarantee:**\n\n✅ **Our Promise:**\n• Harvested within 24-48 hours\n• Direct from farm to your door\n• No middlemen involved\n• Quality checked before dispatch\n\n🌱 **Freshness Indicators:**\n• Harvest date on packaging\n• Farmer details included\n• 100% satisfaction guarantee\n\nIf not fresh, we\'ll replace or refund!',
      
      'payment': '💳 **Payment Methods:**\n\n💰 **Digital Payments:**\n• Credit/Debit Cards (Visa, Mastercard)\n• UPI (PhonePe, Google Pay, Paytm)\n• Net Banking (All major banks)\n• Digital Wallets\n\n💵 **Cash Options:**\n• Cash on Delivery (COD)\n• Available for orders up to ₹2000\n\n🔒 **Security:**\n• SSL encrypted transactions\n• PCI DSS compliant\n• Your data is safe with us',
      
      'return': '↩️ **Return & Refund Policy:**\n\n✅ **100% Satisfaction Guarantee:**\n• Not satisfied? Full refund!\n• Contact within 24 hours of delivery\n• No questions asked policy\n\n🔄 **Process:**\n1️⃣ Report issue via app/call\n2️⃣ Our team will verify\n3️⃣ Instant refund or replacement\n4️⃣ Refund in 2-3 business days\n\n📞 **Quick Support:** 1800-FARM-HELP'
    };
    
    const lowerMessage = message.toLowerCase();
    for (let key in responses) {
      if (lowerMessage.includes(key)) {
        return responses[key];
      }
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return '👋 Hello! Welcome to GoFarm! I\'m excited to help you find the freshest produce directly from farmers. What can I help you with today?';
    }
    
    if (lowerMessage.includes('thank')) {
      return '🙏 You\'re very welcome! I\'m always here to help you with your shopping needs. Happy shopping with GoFarm! 🛒';
    }
    
    return '🤔 That\'s a great question! While I don\'t have specific information about that right now, our customer support team can help you better.\n\n📞 **Contact Options:**\n• Call: 1800-GOFARM-1\n• Email: support@gofarm.com\n• Live Chat: Available 24/7\n\nIs there anything else about products, orders, or delivery I can help you with?';
  };

  const handleQuickQuestion = (question) => {
    const userMessage = { 
      type: 'user', 
      text: question.text, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      const botResponse = getBotResponse(question.text);
      const botMessage = { 
        type: 'bot', 
        text: botResponse, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center">
          <button onClick={() => window.history.back()} className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 animate-pulse">
              <i className="fas fa-robot text-blue-600"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">{t('consumerChatbot.title')}</h1>
              <p className="text-sm text-blue-200">{t('consumerChatbot.onlineStatus')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto pb-48">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                  : 'bg-white text-gray-800 shadow-md border border-gray-100'
              }`}>
                {message.type === 'bot' && (
                  <div className="flex items-center mb-2">
                    <i className="fas fa-robot text-blue-600 mr-2"></i>
                    <span className="font-semibold text-sm text-blue-600">{t('consumerChatbot.title')}</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Questions */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-gray-600 mb-3 font-semibold flex items-center">
            <i className="fas fa-bolt text-yellow-500 mr-2"></i>
            {t('consumerChatbot.quickQuestions')}:
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm hover:bg-blue-200 transition-all transform hover:scale-105 shadow-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-2">
          <button className="text-gray-400 hover:text-blue-600 transition p-2">
            <i className="fas fa-paperclip text-xl"></i>
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('consumerChatbot.askAnything')}
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all w-12 h-12 flex items-center justify-center shadow-lg transform hover:scale-110"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
