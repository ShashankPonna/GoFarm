import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

const Negotiation = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chat');
      setChats(response.data.chats || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const fetchChatMessages = async (chatId) => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      setSelectedChat(response.data.chat);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    try {
      await api.post('/chat/message', {
        chatId: selectedChat._id,
        content: message
      });
      
      setMessage('');
      fetchChatMessages(selectedChat._id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const respondToNegotiation = async (messageId, status, counterPrice = null) => {
    try {
      await api.post('/chat/negotiation/respond', {
        chatId: selectedChat._id,
        messageId,
        status,
        counterPrice
      });
      
      fetchChatMessages(selectedChat._id);
    } catch (error) {
      console.error('Error responding to negotiation:', error);
    }
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p._id !== user?.id);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => navigate(-1)} className="mr-3">
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <div>
                <h2 className="text-xl font-bold">Negotiations</h2>
                <p className="text-sm text-green-200">Chat with retailers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <i className="fas fa-comments text-6xl mb-4"></i>
              <p>No conversations yet</p>
            </div>
          ) : (
            chats.map(chat => {
              const otherUser = getOtherParticipant(chat);
              return (
                <div
                  key={chat._id}
                  onClick={() => fetchChatMessages(chat._id)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?._id === chat._id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg mr-3">
                      {otherUser?.name?.charAt(0) || 'R'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-gray-800">{otherUser?.name || 'Retailer'}</h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{chat.lastMessage || 'No messages'}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold mr-3">
                  {getOtherParticipant(selectedChat)?.name?.charAt(0) || 'R'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {getOtherParticipant(selectedChat)?.name || 'Retailer'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getOtherParticipant(selectedChat)?.role || 'Retailer'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {selectedChat.messages?.map((msg, index) => {
                const isOwn = msg.sender._id === user?.id;
                
                if (msg.messageType === 'negotiation') {
                  return (
                    <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md ${isOwn ? 'bg-green-100' : 'bg-white'} rounded-lg shadow-md p-4`}>
                        <div className="flex items-center mb-2">
                          <i className="fas fa-handshake text-blue-600 mr-2"></i>
                          <span className="font-semibold text-gray-800">Negotiation Offer</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><strong>Product:</strong> {msg.negotiation.productName}</p>
                          <p><strong>Original Price:</strong> ₹{msg.negotiation.originalPrice}</p>
                          <p><strong>Proposed Price:</strong> ₹{msg.negotiation.proposedPrice}</p>
                          <p><strong>Quantity:</strong> {msg.negotiation.quantity}</p>
                          <div className="mt-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              msg.negotiation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              msg.negotiation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              msg.negotiation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {msg.negotiation.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        {!isOwn && msg.negotiation.status === 'pending' && (
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => respondToNegotiation(msg._id, 'accepted')}
                              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                const counter = prompt('Enter counter price:');
                                if (counter) respondToNegotiation(msg._id, 'counter', parseFloat(counter));
                              }}
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                            >
                              Counter
                            </button>
                            <button
                              onClick={() => respondToNegotiation(msg._id, 'rejected')}
                              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-2">{formatTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md ${isOwn ? 'bg-green-600 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-3`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-green-200' : 'text-gray-500'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <i className="fas fa-comments text-6xl mb-4"></i>
              <p className="text-xl">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Negotiation;
