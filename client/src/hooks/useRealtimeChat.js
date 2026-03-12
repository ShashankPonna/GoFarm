import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export const useRealtimeChat = (chatId) => {
  const { socket, connected, joinChatRoom, leaveChatRoom } = useSocket();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!socket || !connected || !chatId) return;

    // Join chat room
    joinChatRoom(chatId);

    // Listen for new messages
    const handleNewMessage = (data) => {
      console.log('💬 New message received:', data);
      if (data.chatId === chatId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    // Listen for negotiation updates
    const handleNegotiationUpdate = (data) => {
      console.log('💰 Negotiation update:', data);
      if (data.chatId === chatId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    // Listen for typing indicators
    const handleUserTyping = (data) => {
      setTypingUsers((prev) => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    };

    const handleUserStopTyping = (data) => {
      setTypingUsers((prev) => prev.filter(u => u.userId !== data.userId));
    };

    socket.on('new-message', handleNewMessage);
    socket.on('negotiation-update', handleNegotiationUpdate);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stop-typing', handleUserStopTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('negotiation-update', handleNegotiationUpdate);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stop-typing', handleUserStopTyping);
      leaveChatRoom(chatId);
    };
  }, [socket, connected, chatId, joinChatRoom, leaveChatRoom]);

  return { messages, setMessages, typingUsers, connected };
};
