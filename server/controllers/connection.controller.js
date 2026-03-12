const Connection = require('../models/Connection.model');
const User = require('../models/User.model');

// Send a connection request
exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;

    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: 'Cannot connect to yourself' });
    }

    // Check if a connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({ success: false, message: 'Connection already exists' });
    }

    const connection = new Connection({
      sender: senderId,
      receiver: receiverId
    });

    await connection.save();

    res.status(201).json({ success: true, connection });
  } catch (error) {
    console.error('Send connection error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Accept a connection request
exports.acceptRequest = async (req, res) => {
  try {
    const connectionId = req.params.connectionId;
    const userId = req.user.id;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    if (connection.receiver.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this request' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Connection is already ${connection.status}` });
    }

    connection.status = 'accepted';
    await connection.save();

    res.status(200).json({ success: true, connection });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reject a connection request
exports.rejectRequest = async (req, res) => {
  try {
    const connectionId = req.params.connectionId;
    const userId = req.user.id;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    if (connection.receiver.toString() !== userId && connection.sender.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject/cancel this request' });
    }

    // Instead of keeping rejected connections, just delete them so they can send again later if needed
    await Connection.findByIdAndDelete(connectionId);

    res.status(200).json({ success: true, message: 'Connection request removed' });
  } catch (error) {
    console.error('Reject connection error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all connections for logged in user (sent and received)
exports.getMyConnections = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const connections = await Connection.find({
            $or: [{ sender: userId }, { receiver: userId }]
        });
        
        res.status(200).json({ success: true, connections });
    } catch (error) {
        console.error('Fetch connections error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
