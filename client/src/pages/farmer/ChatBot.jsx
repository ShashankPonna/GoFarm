import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const ChatBot = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      text: t('chatbot.welcomeMessage'),
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    { text: t('chatbot.cropAdvice'), icon: '🌾', category: 'crops' },
    { text: t('chatbot.pestControl'), icon: '🛡️', category: 'disease' },
    { text: t('chatbot.fertilizers'), icon: '🧪', category: 'fertilizer' },
    { text: t('chatbot.weatherInfo'), icon: '🌤️', category: 'weather' },
    { text: t('chatbot.marketPrices'), icon: '💰', category: 'price' },
    { text: t('chatbot.governmentSchemes'), icon: '🏛️', category: 'scheme' }
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
      setIsTyping(true);
      setShowQuickQuestions(false);
      
      // Simulate bot typing delay
      setTimeout(() => {
        const botResponse = getBotResponse(inputMessage);
        const botMessage = { 
          type: 'bot', 
          text: botResponse, 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5s
    }
  };

  const getBotResponse = (message) => {
    const responses = {
      'crops': '🌾 Based on current season and market trends, I recommend:\n\n• **Tomatoes** - High demand, ₹35-40/kg\n• **Potatoes** - Stable market, ₹25-30/kg\n• **Wheat** - Government procurement available\n• **Onions** - Good export potential\n\nConsider your soil type and local climate for best results!',
      
      'disease': '🛡️ **Disease Prevention Strategy:**\n\n✅ **Prevention:**\n• Use certified disease-resistant seeds\n• Maintain 2-3 feet spacing between plants\n• Rotate crops every season\n• Remove infected plants immediately\n\n✅ **Treatment:**\n• Neem oil spray (organic)\n• Copper fungicide for fungal diseases\n• Regular monitoring twice a week',
      
      'fertilizer': '🧪 **Fertilizer Recommendations:**\n\n🌱 **For Vegetables:**\n• **Base:** NPK 10:26:26 (50kg/acre)\n• **Growth:** Urea (25kg/acre after 30 days)\n• **Flowering:** DAP (20kg/acre)\n\n🌿 **Organic Options:**\n• Vermicompost (2 tons/acre)\n• Cow dung manure (5 tons/acre)\n• Bone meal for phosphorus',
      
      'weather': '🌤️ **Weather Update:**\n\n📊 **This Week:**\n• Temperature: 25-32°C\n• Humidity: 65-75%\n• Rainfall: 15-20mm expected\n• Wind: Light to moderate\n\n🌱 **Farming Advice:**\n• Perfect for transplanting\n• Good for irrigation\n• Avoid pesticide spraying during rain',
      
      'price': '💰 **Current Market Prices:**\n\n🥬 **Vegetables:**\n• Tomato: ₹30-35/kg ⬆️\n• Potato: ₹22-28/kg ➡️\n• Onion: ₹25-30/kg ⬆️\n• Cabbage: ₹15-20/kg ➡️\n\n🌾 **Grains:**\n• Wheat: ₹2,200-2,400/quintal\n• Rice: ₹2,800-3,200/quintal\n\n*Prices updated today*',
      
      'scheme': '🏛️ **Government Schemes for Farmers:**\n\n💰 **Financial Support:**\n• **PM-KISAN:** ₹6,000/year direct transfer\n• **Crop Insurance:** Up to 90% premium subsidy\n• **KCC:** Low interest farm loans\n\n🌱 **Development Schemes:**\n• **Soil Health Card:** Free soil testing\n• **Organic Farming:** 50% subsidy on inputs\n• **Drip Irrigation:** 55% subsidy\n\nVisit your nearest agriculture office or call 1800-180-1551'
    };
    
    const lowerMessage = message.toLowerCase();
    for (let key in responses) {
      if (lowerMessage.includes(key)) {
        return responses[key];
      }
    }
    
    // Smart responses based on keywords
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return '👋 Hello there! I\'m excited to help you with your farming questions. What would you like to know about today?';
    }
    
    if (lowerMessage.includes('thank')) {
      return '🙏 You\'re very welcome! I\'m always here to help. Feel free to ask me anything about farming, crops, or agriculture. Happy farming! 🌱';
    }
    
    return '🤔 That\'s an interesting question! While I don\'t have specific information about that right now, I recommend:\n\n• Consulting your local Krishi Vigyan Kendra\n• Contacting agriculture extension officer\n• Visiting government agriculture portal\n\nIs there anything else about crops, diseases, fertilizers, or schemes I can help you with?';
  };

  const handleQuickQuestion = (question) => {
    const userMessage = { 
      type: 'user', 
      text: question.text, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setShowQuickQuestions(false);
    
    setTimeout(() => {
      const botResponse = getBotResponse(question.text);
      const botMessage = { 
        type: 'bot', 
        text: botResponse, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center">
          <button 
            onClick={() => window.history.back()} 
            className="mr-4 p-2 rounded-full hover:bg-white/20 transition-all duration-200"
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <div className="flex items-center">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-white to-green-100 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <i className="fas fa-robot text-green-600 text-xl"></i>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center">
                🤖 AI Farm Assistant
                <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">SMART</span>
              </h1>
              <p className="text-sm text-green-200 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Online • Ready to help 24/7
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto pb-48 relative">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`mb-6 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`max-w-xs lg:max-w-lg relative group ${
                message.type === 'user' ? 'ml-12' : 'mr-12'
              }`}>
                {message.type === 'bot' && (
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                      <i className="fas fa-robot text-white text-sm"></i>
                    </div>
                    <span className="font-semibold text-sm text-gray-700">AI Farm Assistant</span>
                    <span className="ml-2 text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                  </div>
                )}
                
                <div className={`px-4 py-3 rounded-2xl shadow-lg relative ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-md' 
                    : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                }`}>
                  {message.type === 'user' && (
                    <div className="flex items-center justify-end mb-1">
                      <span className="text-xs text-green-100 mr-2">{formatTime(message.timestamp)}</span>
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-xs"></i>
                      </div>
                    </div>
                  )}
                  
                  <div className={`text-sm leading-relaxed ${message.type === 'bot' ? 'whitespace-pre-line' : ''}`}>
                    {message.text}
                  </div>
                  
                  {/* Message tail */}
                  <div className={`absolute top-4 ${
                    message.type === 'user' 
                      ? 'right-0 transform translate-x-2' 
                      : 'left-0 transform -translate-x-2'
                  }`}>
                    <div className={`w-3 h-3 rotate-45 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-white border-l border-b border-gray-100'
                    }`}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="mb-6 flex justify-start animate-fade-in">
              <div className="max-w-xs lg:max-w-lg mr-12">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                    <i className="fas fa-robot text-white text-sm"></i>
                  </div>
                  <span className="font-semibold text-sm text-gray-700">AI Farm Assistant</span>
                  <span className="ml-2 text-xs text-gray-500">typing...</span>
                </div>
                
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-lg border border-gray-100 relative">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  
                  <div className="absolute top-4 left-0 transform -translate-x-2">
                    <div className="w-3 h-3 rotate-45 bg-white border-l border-b border-gray-100"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      {showQuickQuestions && (
        <div className="fixed bottom-20 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm border-t border-gray-200 p-4 animate-slide-up">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700 flex items-center">
                <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                Quick questions to get started:
              </p>
              <button 
                onClick={() => setShowQuickQuestions(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-105 border border-green-200 flex items-center group"
                >
                  <span className="text-lg mr-3 group-hover:scale-110 transition-transform">
                    {question.icon}
                  </span>
                  <span className="text-left">{question.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ask me anything about farming, crops, diseases, weather..."
                className="w-full px-4 py-3 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                disabled={isTyping}
              />
              {!showQuickQuestions && (
                <button
                  onClick={() => setShowQuickQuestions(true)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                  title="Show quick questions"
                >
                  <i className="fas fa-lightbulb"></i>
                </button>
              )}
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px]"
            >
              {isTyping ? (
                <i className="fas fa-spinner animate-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-center mt-2 space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <i className="fas fa-shield-alt mr-1 text-green-500"></i>
              Secure & Private
            </span>
            <span className="flex items-center">
              <i className="fas fa-clock mr-1 text-blue-500"></i>
              24/7 Available
            </span>
            <span className="flex items-center">
              <i className="fas fa-brain mr-1 text-purple-500"></i>
              AI Powered
            </span>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
