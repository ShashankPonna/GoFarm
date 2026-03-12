import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useRealtimeChat } from '../hooks/useRealtimeChat';
import { chatAPI } from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ChatRoom = ({ chatId, currentUser, onClose }) => {
  const [chat, setChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { emitTyping, emitStopTyping } = useSocket();
  const { messages, setMessages, typingUsers, connected } = useRealtimeChat(chatId);

  useEffect(() => {
    fetchChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const response = await chatAPI.getChatById(chatId);
        setChat(response.data.chat);
        setMessages(response.data.chat.messages || []);
      } catch (apiError) {
        console.log('API not available, using demo chat data');
        
        // Create demo chat data based on chatId
        if (chatId === 'demo-chat-1') {
          // Demo conversation between farmer and retailer about tomatoes
          const demoChat = {
            _id: 'demo-chat-1',
            participants: [
              {
                _id: currentUser.role === 'farmer' ? 'demo-retailer-1' : 'demo-farmer-1',
                name: currentUser.role === 'farmer' ? 'Priya Sharma (Demo Retailer)' : 'Ramesh Kumar (Demo Farmer)',
                role: currentUser.role === 'farmer' ? 'retailer' : 'farmer',
                email: currentUser.role === 'farmer' ? 'priya@demo.com' : 'ramesh@demo.com'
              },
              {
                _id: currentUser._id,
                name: currentUser.name,
                role: currentUser.role,
                email: currentUser.email
              }
            ],
            chatType: 'direct'
          };

          // Demo messages between farmer and retailer
          const demoMessages = currentUser.role === 'farmer' ? [
            {
              _id: 'msg-1',
              sender: {
                _id: 'demo-retailer-1',
                name: 'Priya Sharma (Demo Retailer)',
                role: 'retailer'
              },
              content: 'Hello! I saw your fresh tomatoes listing. Are they still available?',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
              read: true
            },
            {
              _id: 'msg-2',
              sender: {
                _id: currentUser._id,
                name: currentUser.name,
                role: 'farmer'
              },
              content: 'Yes, I have 500kg of fresh tomatoes available. They were harvested yesterday.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
              read: true
            },
            {
              _id: 'msg-3',
              sender: {
                _id: 'demo-retailer-1',
                name: 'Priya Sharma (Demo Retailer)',
                role: 'retailer'
              },
              content: 'Great! What\'s your price per kg? I need about 200kg for my store.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
              read: true
            },
            {
              _id: 'msg-4',
              sender: {
                _id: currentUser._id,
                name: currentUser.name,
                role: 'farmer'
              },
              content: 'I\'m selling at ₹30 per kg. These are premium quality, organic tomatoes.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
              read: true
            },
            {
              _id: 'msg-5',
              sender: {
                _id: 'demo-retailer-1',
                name: 'Priya Sharma (Demo Retailer)',
                role: 'retailer'
              },
              content: 'That\'s a bit high for my budget. Can you do ₹25 per kg for 200kg? I can pick them up today.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
              read: true
            },
            {
              _id: 'msg-6',
              sender: {
                _id: currentUser._id,
                name: currentUser.name,
                role: 'farmer'
              },
              content: 'I can do ₹27 per kg for 200kg. That\'s my best price for bulk order.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
              read: true
            },
            {
              _id: 'msg-7',
              sender: {
                _id: 'demo-retailer-1',
                name: 'Priya Sharma (Demo Retailer)',
                role: 'retailer'
              },
              content: 'Perfect! ₹27 per kg works for me. When can I come to collect them?',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
              read: false
            }
          ] : [
            // Messages for retailer view
            {
              _id: 'msg-1',
              sender: {
                _id: currentUser._id,
                name: currentUser.name,
                role: 'retailer'
              },
              content: 'Hello! I saw your fresh tomatoes listing. Are they still available?',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
              read: true
            },
            {
              _id: 'msg-2',
              sender: {
                _id: 'demo-farmer-1',
                name: 'Ramesh Kumar (Demo Farmer)',
                role: 'farmer'
              },
              content: 'Yes, I have 500kg of fresh tomatoes available. They were harvested yesterday.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
              read: true
            },
            {
              _id: 'msg-3',
              sender: {
                _id: currentUser._id,
                name: currentUser.name,
                role: 'retailer'
              },
              content: 'Great! What\'s your price per kg? I need about 200kg for my store.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
              read: true
            },
            {
              _id: 'msg-4',
              sender: {
                _id: 'demo-farmer-1',
                name: 'Ramesh Kumar (Demo Farmer)',
                role: 'farmer'
              },
              content: 'I\'m selling at ₹30 per kg. These are premium quality, organic tomatoes.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
              read: true
            },
            {
              _id: 'msg-5',
              sender: {
                _id: currentUser._id,
                name: currentUser.name,
                role: 'retailer'
              },
              content: 'That\'s a bit high for my budget. Can you do ₹25 per kg for 200kg? I can pick them up today.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
              read: true
            },
            {
              _id: 'msg-6',
              sender: {
                _id: 'demo-farmer-1',
                name: 'Ramesh Kumar (Demo Farmer)',
                role: 'farmer'
              },
              content: 'I can do ₹27 per kg for 200kg. That\'s my best price for bulk order.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
              read: true
            },
            {
              _id: 'msg-7',
              sender: {
                _id: currentUser._id,
                name: currentUser.name,
                role: 'retailer'
              },
              content: 'Perfect! ₹27 per kg works for me. When can I come to collect them?',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
              read: false
            }
          ];

          setChat(demoChat);
          setMessages(demoMessages);
        } else if (chatId === 'demo-chat-2') {
          // Demo conversation about organic vegetables
          const demoChat = {
            _id: 'demo-chat-2',
            participants: [
              {
                _id: currentUser.role === 'farmer' ? 'demo-consumer-1' : 'demo-farmer-2',
                name: currentUser.role === 'farmer' ? 'Amit Patel (Demo Consumer)' : 'Sunita Devi (Demo Farmer)',
                role: currentUser.role === 'farmer' ? 'consumer' : 'farmer',
                email: currentUser.role === 'farmer' ? 'amit@demo.com' : 'sunita@demo.com'
              },
              {
                _id: currentUser._id,
                name: currentUser.name,
                role: currentUser.role,
                email: currentUser.email
              }
            ],
            chatType: 'direct'
          };

          const demoMessages = currentUser.role === 'farmer' ? [
            {
              _id: 'msg-1',
              sender: {
                _id: 'demo-consumer-1',
                name: 'Amit Patel (Demo Consumer)',
                role: 'consumer'
              },
              content: 'Hi! Do you have organic vegetables available? I\'m looking for fresh produce.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
              read: true
            },
            {
              _id: 'msg-2',
              sender: {
                _id: currentUser._id,
                name: currentUser.name,
                role: 'farmer'
              },
              content: 'Yes! I have fresh organic carrots, spinach, and cauliflower. All certified organic.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
              read: true
            },
            {
              _id: 'msg-3',
              sender: {
                _id: 'demo-consumer-1',
                name: 'Amit Patel (Demo Consumer)',
                role: 'consumer'
              },
              content: 'Perfect! What are the prices? I need about 2kg of each.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
              read: false
            }
          ] : [
            {
              _id: 'msg-1',
              sender: {
                _id: currentUser._id,
                name: currentUser.name,
                role: 'consumer'
              },
              content: 'Hi! Do you have organic vegetables available? I\'m looking for fresh produce.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
              read: true
            },
            {
              _id: 'msg-2',
              sender: {
                _id: 'demo-farmer-2',
                name: 'Sunita Devi (Demo Farmer)',
                role: 'farmer'
              },
              content: 'Yes! I have fresh organic carrots, spinach, and cauliflower. All certified organic.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
              read: true
            },
            {
              _id: 'msg-3',
              sender: {
                _id: currentUser._id,
                name: currentUser.name,
                role: 'consumer'
              },
              content: 'Perfect! What are the prices? I need about 2kg of each.',
              messageType: 'text',
              createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
              read: false
            }
          ];

          setChat(demoChat);
          setMessages(demoMessages);
        }
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!connected) return;

    emitTyping(chatId, currentUser._id, currentUser.name);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(chatId, currentUser._id);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sending) return;

    try {
      setSending(true);
      emitStopTyping(chatId, currentUser._id);

      // Try to send via API first
      try {
        await chatAPI.sendMessage({
          chatId,
          content: messageInput.trim()
        });
        setMessageInput('');
      } catch (apiError) {
        console.log('API not available, adding demo message');
        
        // Add message to demo chat
        const newMessage = {
          _id: `demo-msg-${Date.now()}`,
          sender: {
            _id: currentUser._id,
            name: currentUser.name,
            role: currentUser.role
          },
          content: messageInput.trim(),
          messageType: 'text',
          createdAt: new Date(),
          read: false
        };

        setMessages(prev => [...prev, newMessage]);
        setMessageInput('');
        
        // Simulate a response from the other user after a delay
        setTimeout(() => {
          const otherUser = getOtherParticipant();
          if (otherUser) {
            const responses = [
              'That sounds good to me!',
              'Let me check and get back to you.',
              'I agree with your proposal.',
              'Can we discuss this further?',
              'Thank you for the information.',
              'I\'ll consider your offer.',
              'When would be a good time to meet?',
              'That works for me.'
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            const responseMessage = {
              _id: `demo-response-${Date.now()}`,
              sender: {
                _id: otherUser._id,
                name: otherUser.name,
                role: otherUser.role
              },
              content: randomResponse,
              messageType: 'text',
              createdAt: new Date(),
              read: false
            };

            setMessages(prev => [...prev, responseMessage]);
          }
        }, 2000 + Math.random() * 3000); // Random delay between 2-5 seconds
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (!chat) return null;
    return chat.participants.find(p => p._id !== currentUser._id);
  };

  const otherUser = getOtherParticipant();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold mr-3">
            {otherUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-lg">{otherUser?.name}</h3>
            <p className="text-xs text-blue-100">
              {otherUser?.role} {connected && <span className="ml-2">● Online</span>}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <i className="fas fa-comments text-4xl mb-2"></i>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender?._id === currentUser._id;
            const showAvatar = index === 0 || messages[index - 1].sender?._id !== message.sender?._id;

            return (
              <div
                key={message._id || index}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end`}
              >
                {!isOwn && showAvatar && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mr-2">
                    {message.sender?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {!isOwn && !showAvatar && <div className="w-8 mr-2"></div>}

                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
                  {message.messageType === 'negotiation' ? (
                    <div className={`p-4 rounded-lg ${isOwn ? 'bg-blue-600 text-white' : 'bg-white border-2 border-blue-300'}`}>
                      <div className="flex items-center mb-2">
                        <i className="fas fa-handshake mr-2"></i>
                        <span className="font-bold">Negotiation Offer</span>
                      </div>
                      <p className="text-sm mb-1">Product: {message.negotiation?.productName}</p>
                      <p className="text-sm mb-1">Original: ₹{message.negotiation?.originalPrice}</p>
                      <p className="text-sm mb-1">Proposed: ₹{message.negotiation?.proposedPrice}</p>
                      <p className="text-sm mb-2">Quantity: {message.negotiation?.quantity}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        message.negotiation?.status === 'accepted' ? 'bg-green-500' :
                        message.negotiation?.status === 'rejected' ? 'bg-red-500' :
                        'bg-yellow-500'
                      } text-white`}>
                        {message.negotiation?.status?.toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div className={`p-3 rounded-lg ${isOwn ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'}`}>
                      <p className="break-words">{message.content}</p>
                    </div>
                  )}
                  <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {message.createdAt ? format(new Date(message.createdAt), 'HH:mm') : 'Now'}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center text-gray-500 text-sm">
            <div className="flex space-x-1 mr-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{typingUsers[0].userName} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || sending}
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {sending ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
