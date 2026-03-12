import { useState, useEffect } from 'react';
import { chatAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../context/SocketContext';
import ChatRoom from '../../components/ChatRoom';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showChatRoom, setShowChatRoom] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = 'Chat - GOFaRm';
    return () => {
      document.title = 'GOFaRm - Agricultural Marketplace';
    };
  }, []);

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (socket && typeof socket.on === 'function') {
      socket.on('new-message', (data) => {
        // Update chat list with new message
        setChats(prev => prev.map(chat =>
          chat._id === data.chatId
            ? { ...chat, lastMessage: data.message.content, lastMessageAt: new Date() }
            : chat
        ));
      });

      return () => {
        if (socket && typeof socket.off === 'function') {
          socket.off('new-message');
        }
      };
    }
  }, [socket]);

  const fetchChats = async () => {
    try {
      setLoading(true);

      let chats = [];

      // Try to fetch from API first
      try {
        const response = await chatAPI.getChats();
        chats = response.data.chats || [];
      } catch (apiError) {
        console.log('API not available, using demo chats');
        // Demo chats with conversation between farmer and retailer
        chats = [
          {
            _id: 'demo-chat-1',
            participants: [
              {
                _id: user.role === 'farmer' ? 'demo-retailer-1' : 'demo-farmer-1',
                name: user.role === 'farmer' ? 'Priya Sharma (Demo Retailer)' : 'Ramesh Kumar (Demo Farmer)',
                role: user.role === 'farmer' ? 'retailer' : 'farmer',
                email: user.role === 'farmer' ? 'priya@demo.com' : 'ramesh@demo.com'
              },
              {
                _id: user._id,
                name: user.name,
                role: user.role,
                email: user.email
              }
            ],
            lastMessage: user.role === 'farmer'
              ? 'I need 500kg of fresh tomatoes. What\'s your best price?'
              : 'Yes, I can supply 500kg tomatoes at ₹25/kg. When do you need them?',
            lastMessageAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
            unreadCount: new Map([[user._id, 1]]),
            chatType: 'direct'
          },
          {
            _id: 'demo-chat-2',
            participants: [
              {
                _id: user.role === 'farmer' ? 'demo-consumer-1' : 'demo-farmer-2',
                name: user.role === 'farmer' ? 'Amit Patel (Demo Consumer)' : 'Sunita Devi (Demo Farmer)',
                role: user.role === 'farmer' ? 'consumer' : 'farmer',
                email: user.role === 'farmer' ? 'amit@demo.com' : 'sunita@demo.com'
              },
              {
                _id: user._id,
                name: user.name,
                role: user.role,
                email: user.email
              }
            ],
            lastMessage: user.role === 'farmer'
              ? 'Do you have organic vegetables available?'
              : 'Yes! I have fresh organic carrots, spinach, and cauliflower.',
            lastMessageAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            unreadCount: new Map(),
            chatType: 'direct'
          }
        ];
      }

      setChats(chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setShowChatRoom(true);
  };

  const handleCloseChatRoom = () => {
    setShowChatRoom(false);
    setSelectedChat(null);
    // Refresh chats to update unread counts
    fetchChats();
  };

  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);

      let users = [];

      // Try to fetch from API first
      try {
        const response = await chatAPI.getAvailableUsers();
        users = response.data.users || [];
      } catch (apiError) {
        // Fallback to sample users if API is not available
        console.log('API not available, using sample data');
        users = [
          {
            _id: 'sample-farmer-1',
            name: 'Ramesh Kumar',
            role: 'farmer',
            email: 'ramesh@example.com'
          },
          {
            _id: 'sample-retailer-1',
            name: 'Priya Sharma',
            role: 'retailer',
            email: 'priya@example.com'
          },
          {
            _id: 'sample-consumer-1',
            name: 'Amit Patel',
            role: 'consumer',
            email: 'amit@example.com'
          },
          {
            _id: 'sample-farmer-2',
            name: 'Sunita Devi',
            role: 'farmer',
            email: 'sunita@example.com'
          },
          {
            _id: 'sample-retailer-2',
            name: 'Rajesh Gupta',
            role: 'retailer',
            email: 'rajesh@example.com'
          }
        ];
      }

      // Filter out current user and existing chat participants
      const existingParticipants = new Set();
      chats.forEach(chat => {
        chat.participants?.forEach(p => {
          if (p._id !== user._id) {
            existingParticipants.add(p._id);
          }
        });
      });

      const filteredUsers = users.filter(u =>
        u._id !== user._id && !existingParticipants.has(u._id)
      );

      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartNewChat = async (participantId) => {
    try {
      const response = await chatAPI.createChat(participantId);
      setShowNewChatModal(false);
      setSelectedChat(response.data.chat);
      setShowChatRoom(true);
      // Refresh chats to include the new one
      fetchChats();
      toast.success('Chat started!');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const openNewChatModal = () => {
    setShowNewChatModal(true);
    fetchAvailableUsers();
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getOtherParticipant = (chat) => {
    return chat.participants?.find(p => p._id !== user._id);
  };

  const getUnreadCount = (chat) => {
    if (!chat.unreadCount || !user._id) return 0;
    if (chat.unreadCount instanceof Map) {
      return chat.unreadCount.get(user._id) || 0;
    }
    return chat.unreadCount[user._id] || 0;
  };

  const filteredChats = chats.filter(chat => {
    const otherUser = getOtherParticipant(chat);
    return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalUnread = chats.reduce((sum, chat) => sum + getUnreadCount(chat), 0);

  // Show ChatRoom if a chat is selected
  if (showChatRoom && selectedChat) {
    return (
      <ChatRoom
        chatId={selectedChat._id}
        currentUser={user}
        onClose={handleCloseChatRoom}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Chat List */}
      <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button onClick={() => window.history.back()} className="mr-3 hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all">
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold">Messages</h1>
            </div>
            <div className="flex items-center space-x-2">
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {totalUnread}
                </span>
              )}
              <button
                onClick={openNewChatModal}
                className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                title="Start new chat"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-3 text-green-200"></i>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-green-200 focus:outline-none focus:bg-opacity-30"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map(chat => {
              const otherUser = getOtherParticipant(chat);
              const unreadCount = getUnreadCount(chat);

              return (
                <div
                  key={chat._id}
                  onClick={() => handleChatSelect(chat)}
                  className="p-4 border-b border-gray-200 cursor-pointer transition-all hover:bg-gray-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${otherUser?.role === 'farmer'
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : otherUser?.role === 'retailer'
                            ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                            : 'bg-gradient-to-r from-purple-400 to-purple-600'
                        }`}>
                        {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{otherUser?.name || 'Unknown User'}</h3>
                        <span className="text-xs text-gray-500">{formatTime(chat.lastMessageAt)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1">{chat.lastMessage || 'No messages yet'}</p>
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${otherUser?.role === 'farmer'
                            ? 'bg-green-100 text-green-800'
                            : otherUser?.role === 'retailer'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                          {otherUser?.role === 'farmer' ? 'Farmer' :
                            otherUser?.role === 'retailer' ? 'Retailer' :
                              otherUser?.role === 'consumer' ? 'Consumer' : 'User'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-white">
              <i className="fas fa-comments text-4xl mb-4 opacity-50"></i>
              <p className="text-lg mb-2">No conversations yet</p>
              <p className="text-sm opacity-75 mb-4">Start chatting with farmers, retailers, or consumers!</p>
              <button
                onClick={openNewChatModal}
                className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                <i className="fas fa-plus mr-2"></i>
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area - Desktop Only */}
      <div className="hidden md:flex flex-1 flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-comments text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a chat from the list to start messaging</p>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-96 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Start New Chat</h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div className="p-4">
              {loadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : availableUsers.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableUsers.map(user => (
                    <div
                      key={user._id}
                      onClick={() => handleStartNewChat(user._id)}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-all"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'farmer'
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : user.role === 'retailer'
                            ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                            : 'bg-gradient-to-r from-purple-400 to-purple-600'
                        }`}>
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{user.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'farmer'
                              ? 'bg-green-100 text-green-800'
                              : user.role === 'retailer'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                            {user.role === 'farmer' ? 'Farmer' :
                              user.role === 'retailer' ? 'Retailer' :
                                'Consumer'}
                          </span>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-gray-400"></i>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-users text-gray-300 text-4xl mb-4"></i>
                  <p className="text-gray-600 mb-2">No new users to chat with</p>
                  <p className="text-sm text-gray-500">All available users already have conversations with you</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
