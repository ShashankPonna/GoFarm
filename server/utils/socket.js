// Socket.IO utility for handling real-time events
let io;

const initializeSocket = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    // Join user to their personal room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join chat room
    socket.on('join-chat-room', (chatId) => {
      socket.join(`chat-${chatId}`);
      console.log(`User joined chat room: ${chatId}`);
    });

    // Leave chat room
    socket.on('leave-chat-room', (chatId) => {
      socket.leave(`chat-${chatId}`);
      console.log(`User left chat room: ${chatId}`);
    });

    // Handle chat messages
    socket.on('send-message', (data) => {
      io.to(`chat-${data.chatId}`).emit('receive-message', data);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.to(`chat-${data.chatId}`).emit('user-typing', {
        userId: data.userId,
        userName: data.userName
      });
    });

    socket.on('stop-typing', (data) => {
      socket.to(`chat-${data.chatId}`).emit('user-stop-typing', {
        userId: data.userId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  return io;
};

// Emit product added event to all retailers
const emitProductAdded = (product) => {
  if (io) {
    io.emit('product-added', product);
    console.log('📦 Product added event emitted:', product._id);
  }
};

// Emit product updated event
const emitProductUpdated = (product) => {
  if (io) {
    io.emit('product-updated', product);
    console.log('📦 Product updated event emitted:', product._id);
  }
};

// Emit product deleted event
const emitProductDeleted = (productId) => {
  if (io) {
    io.emit('product-deleted', { productId });
    console.log('📦 Product deleted event emitted:', productId);
  }
};

// Emit new message to chat room
const emitNewMessage = (chatId, message) => {
  if (io) {
    io.to(`chat-${chatId}`).emit('new-message', message);
    console.log('💬 New message emitted to chat:', chatId);
  }
};

// Emit negotiation update
const emitNegotiationUpdate = (chatId, data) => {
  if (io) {
    io.to(`chat-${chatId}`).emit('negotiation-update', data);
    console.log('💰 Negotiation update emitted to chat:', chatId);
  }
};

// Emit order status update to specific user
const emitOrderUpdate = (userId, order) => {
  if (io) {
    io.to(`user-${userId}`).emit('order-updated', order);
    console.log('📋 Order update emitted to user:', userId);
  }
};

// Emit event to all connected clients
const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`📡 Event '${event}' emitted to all clients`);
  }
};

// Emit waste product events
const emitWasteProductAdded = (wasteProduct) => {
  if (io) {
    io.emit('waste-product-added', wasteProduct);
    console.log('♻️ Waste product added event emitted:', wasteProduct._id);
  }
};

const emitWasteProductUpdated = (wasteProduct) => {
  if (io) {
    io.emit('waste-product-updated', wasteProduct);
    console.log('♻️ Waste product updated event emitted:', wasteProduct._id);
  }
};

module.exports = {
  initializeSocket,
  emitProductAdded,
  emitProductUpdated,
  emitProductDeleted,
  emitNewMessage,
  emitNegotiationUpdate,
  emitOrderUpdate,
  emitToAll,
  emitWasteProductAdded,
  emitWasteProductUpdated
};
