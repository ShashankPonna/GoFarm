const User = require('../models/User.model');

// Get all retailers (public — farmers use this to find buyers)
exports.getRetailers = async (req, res) => {
  try {
    const retailers = await User.find({ role: 'retailer' })
      .select('name email phone mobile address city state profileImage createdAt')
      .sort({ name: 1 });
    res.json({ success: true, retailers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get users available for chat (excluding current user and existing chat participants)
exports.getAvailableUsersForChat = async (req, res) => {
  try {
    // Get all users except current user
    const users = await User.find({
      _id: { $ne: req.user.id },
      role: { $in: ['farmer', 'retailer', 'consumer'] }
    })
      .select('name email role')
      .limit(20)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
      message: 'Available users fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching available users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email role avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { q, role } = req.query;

    let query = { _id: { $ne: req.user.id } };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('name email role')
      .limit(10)
      .sort({ name: 1 });

    res.json({
      success: true,
      users,
      message: 'Users found successfully'
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};