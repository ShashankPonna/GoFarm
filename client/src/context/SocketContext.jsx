import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  // Ref guard prevents StrictMode double-mount from creating 2 sockets
  const socketRef = useRef(null);

  useEffect(() => {
    // If socket already exists (StrictMode re-run), skip creating another
    if (socketRef.current) return;

    const baseUrl = process.env.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const newSocket = io(baseUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setConnected(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user._id) {
        newSocket.emit('join-user-room', user._id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, []);

  const joinChatRoom = (chatId) => {
    if (socket && connected) socket.emit('join-chat-room', chatId);
  };

  const leaveChatRoom = (chatId) => {
    if (socket && connected) socket.emit('leave-chat-room', chatId);
  };

  const sendMessage = (chatId, message) => {
    if (socket && connected) socket.emit('send-message', { chatId, ...message });
  };

  const emitTyping = (chatId, userId, userName) => {
    if (socket && connected) socket.emit('typing', { chatId, userId, userName });
  };

  const emitStopTyping = (chatId, userId) => {
    if (socket && connected) socket.emit('stop-typing', { chatId, userId });
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinChatRoom, leaveChatRoom, sendMessage, emitTyping, emitStopTyping }}>
      {children}
    </SocketContext.Provider>
  );
};
