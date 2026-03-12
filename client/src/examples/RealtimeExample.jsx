/**
 * EXAMPLE: How to use Real-Time Features in Your Components
 * 
 * This file demonstrates how to integrate real-time product updates
 * and chat functionality into your React components.
 */

import { useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useRealtimeProducts } from '../hooks/useRealtimeProducts';
import { useRealtimeChat } from '../hooks/useRealtimeChat';
import toast from 'react-hot-toast';

// ============================================
// EXAMPLE 1: Real-Time Product List Component
// ============================================

export const RealtimeProductList = () => {
  const [products, setProducts] = useState([]);
  const { connected } = useSocket();

  // Handle new product added
  const handleProductAdded = useCallback((newProduct) => {
    console.log('New product received:', newProduct);
    setProducts((prev) => [newProduct, ...prev]);
    toast.success(`New product: ${newProduct.name}`);
  }, []);

  // Handle product updated
  const handleProductUpdated = useCallback((updatedProduct) => {
    console.log('Product updated:', updatedProduct);
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  }, []);

  // Handle product deleted
  const handleProductDeleted = useCallback((productId) => {
    console.log('Product deleted:', productId);
    setProducts((prev) => prev.filter((p) => p._id !== productId));
    toast('A product was removed', {
      icon: 'ℹ️',
      duration: 3000
    });
  }, []);

  // Subscribe to real-time product updates
  useRealtimeProducts(
    handleProductAdded,
    handleProductUpdated,
    handleProductDeleted
  );

  return (
    <div>
      <h2>
        Products {connected && <span className="text-green-500">● Live</span>}
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded">
            <h3>{product.name}</h3>
            <p>₹{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 2: Real-Time Chat Component
// ============================================

export const RealtimeChatExample = ({ chatId, currentUserId }) => {
  const [messageInput, setMessageInput] = useState('');
  const { emitTyping, emitStopTyping, sendMessage, connected } = useSocket();
  
  // Subscribe to real-time chat updates
  const { messages, setMessages, typingUsers } = useRealtimeChat(chatId);

  const handleTyping = () => {
    if (connected) {
      emitTyping(chatId, currentUserId, 'Current User');
      
      // Auto-stop typing after 2 seconds
      setTimeout(() => {
        emitStopTyping(chatId, currentUserId);
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      // Send via API (which will emit socket event)
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, content: messageInput })
      });

      setMessageInput('');
      emitStopTyping(chatId, currentUserId);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-96 border rounded">
      {/* Connection Status */}
      <div className="bg-gray-100 p-2">
        {connected ? (
          <span className="text-green-600">● Connected</span>
        ) : (
          <span className="text-red-600">● Disconnected</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 rounded ${
              msg.sender._id === currentUserId
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-200'
            } max-w-xs`}
          >
            <p>{msg.content}</p>
          </div>
        ))}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="text-gray-500 text-sm italic">
            {typingUsers[0].userName} is typing...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-2 border-t">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => {
            setMessageInput(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="w-full px-3 py-2 border rounded"
        />
      </form>
    </div>
  );
};

// ============================================
// EXAMPLE 3: Manual Socket Event Handling
// ============================================

export const ManualSocketExample = () => {
  const { socket, connected } = useSocket();
  const [notifications, setNotifications] = useState([]);

  // Listen for custom events
  useEffect(() => {
    if (!socket || !connected) return;

    // Listen for order updates
    const handleOrderUpdate = (order) => {
      console.log('Order updated:', order);
      setNotifications((prev) => [
        ...prev,
        { type: 'order', message: `Order #${order._id} updated` }
      ]);
    };

    // Listen for any custom event
    if (socket && socket.on) {
      socket.on('order-updated', handleOrderUpdate);
    }

    // Cleanup
    return () => {
      if (socket && socket.off) {
        socket.off('order-updated', handleOrderUpdate);
      }
    };
  }, [socket, connected]);

  // Emit custom event
  const sendCustomEvent = () => {
    if (socket && connected) {
      socket.emit('custom-event', { data: 'Hello from client' });
    }
  };

  return (
    <div>
      <h3>Notifications</h3>
      <button onClick={sendCustomEvent}>Send Custom Event</button>
      <ul>
        {notifications.map((notif, index) => (
          <li key={index}>{notif.message}</li>
        ))}
      </ul>
    </div>
  );
};

// ============================================
// EXAMPLE 4: Connection Status Component
// ============================================

export const ConnectionStatus = () => {
  const { connected } = useSocket();

  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded-full ${
      connected ? 'bg-green-500' : 'bg-red-500'
    } text-white shadow-lg`}>
      <span className="flex items-center">
        <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};

// ============================================
// EXAMPLE 5: Using in Class Components (Legacy)
// ============================================

import { Component } from 'react';
import { SocketContext } from '../context/SocketContext';

export class LegacyRealtimeComponent extends Component {
  static contextType = SocketContext;

  componentDidMount() {
    const { socket, connected } = this.context;
    
    if (socket && socket.on && connected) {
      socket.on('product-added', this.handleProductAdded);
    }
  }

  componentWillUnmount() {
    const { socket } = this.context;
    
    if (socket && socket.off) {
      socket.off('product-added', this.handleProductAdded);
    }
  }

  handleProductAdded = (product) => {
    console.log('Product added:', product);
    // Update state...
  };

  render() {
    const { connected } = this.context;
    
    return (
      <div>
        Status: {connected ? 'Connected' : 'Disconnected'}
      </div>
    );
  }
}

// ============================================
// USAGE NOTES
// ============================================

/**
 * 1. BASIC USAGE - Real-Time Products
 * 
 * import { useRealtimeProducts } from '../hooks/useRealtimeProducts';
 * 
 * const MyComponent = () => {
 *   const [products, setProducts] = useState([]);
 *   
 *   useRealtimeProducts(
 *     (newProduct) => setProducts(prev => [newProduct, ...prev]),
 *     (updated) => setProducts(prev => prev.map(p => p._id === updated._id ? updated : p)),
 *     (deletedId) => setProducts(prev => prev.filter(p => p._id !== deletedId))
 *   );
 *   
 *   return <div>{products.map(p => <div key={p._id}>{p.name}</div>)}</div>;
 * };
 */

/**
 * 2. BASIC USAGE - Real-Time Chat
 * 
 * import { useRealtimeChat } from '../hooks/useRealtimeChat';
 * 
 * const ChatComponent = ({ chatId }) => {
 *   const { messages, typingUsers, connected } = useRealtimeChat(chatId);
 *   
 *   return (
 *     <div>
 *       {messages.map(msg => <div key={msg._id}>{msg.content}</div>)}
 *       {typingUsers.length > 0 && <div>Someone is typing...</div>}
 *     </div>
 *   );
 * };
 */

/**
 * 3. ACCESSING SOCKET DIRECTLY
 * 
 * import { useSocket } from '../context/SocketContext';
 * 
 * const MyComponent = () => {
 *   const { socket, connected, joinChatRoom } = useSocket();
 *   
 *   useEffect(() => {
 *     if (socket && connected) {
 *       socket.on('custom-event', handleCustomEvent);
 *       return () => socket.off('custom-event', handleCustomEvent);
 *     }
 *   }, [socket, connected]);
 * };
 */

/**
 * 4. BEST PRACTICES
 * 
 * - Always check if socket is connected before emitting
 * - Clean up event listeners in useEffect return
 * - Use useCallback for event handlers to prevent re-renders
 * - Handle reconnection gracefully
 * - Show connection status to users
 * - Implement optimistic updates for better UX
 */

export default {
  RealtimeProductList,
  RealtimeChatExample,
  ManualSocketExample,
  ConnectionStatus,
  LegacyRealtimeComponent
};
