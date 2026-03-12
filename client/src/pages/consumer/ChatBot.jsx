import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
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
  const [isTyping, setIsTyping] = useState(false);

  const sendMessageToAI = async (messageText) => {
    const userMessage = { type: 'user', text: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_URL}/chatbot/message`, {
        message: messageText,
        conversationHistory: messages.slice(-10)
      });

      const botText = response.data.success
        ? response.data.response
        : response.data.fallbackResponse || 'Sorry, I could not process your request.';

      setMessages(prev => [...prev, { type: 'bot', text: botText, timestamp: new Date() }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorText = error.response?.data?.fallbackResponse ||
        '🤖 I\'m having trouble connecting right now. Please try again!';
      setMessages(prev => [...prev, { type: 'bot', text: errorText, timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && !isTyping) {
      sendMessageToAI(inputMessage.trim());
    }
  };

  const handleQuickQuestion = (question) => {
    sendMessageToAI(typeof question === 'object' ? question.text : question);
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
