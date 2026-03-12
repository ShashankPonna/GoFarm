const User = require('../models/User.model');

/**
 * Generate a unique customID: FARM-XXXX or RET-XXXX
 * Uses the current count of users with that role + a random offset to avoid collisions.
 */
const generateCustomID = async (role) => {
  const prefix = role === 'farmer' ? 'FARM' : 'RET';
  let customID;
  let exists = true;

  while (exists) {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000–9999
    customID = `${prefix}-${randomNum}`;
    exists = await User.findOne({ customID });
  }

  return customID;
};

/**
 * POST /api/auth/register
 * Protected by verifyFirebaseToken
 *
 * Body: { name, phone, role, district, taluka, village, pincode }
 */
exports.registerUser = async (req, res) => {
  try {
    const { name, phone, role, district, taluka, village, pincode } = req.body;
    const firebaseUID = req.firebaseUID;

    // Validate required fields
    if (!name || !phone || !role || !district || !taluka || !village || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, phone, role, district, taluka, village, pincode'
      });
    }

    // Validate role
    if (!['farmer', 'retailer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "farmer" or "retailer"'
      });
    }

    // Check if user already exists by firebaseUID
    let user = await User.findOne({ firebaseUID });
    if (user) {
      return res.status(200).json({ success: true, user, existing: true });
    }

    // Check for duplicate phone
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      // If phone belongs to a DIFFERENT firebaseUID, the old Firebase account was deleted
      // Clean up the orphaned MongoDB record and allow re-registration
      if (phoneExists.firebaseUID !== firebaseUID) {
        console.log(`🔄 Orphaned user found: ${phoneExists.customID} (old UID: ${phoneExists.firebaseUID}). Replacing with new Firebase UID.`);
        await User.deleteOne({ _id: phoneExists._id });
      } else {
        // Same Firebase UID + same phone = genuinely duplicate
        return res.status(409).json({
          success: false,
          message: 'This phone number is already registered'
        });
      }
    }

    // Generate unique customID
    const customID = await generateCustomID(role);

    // Create user
    user = new User({
      firebaseUID,
      name,
      phone,
      role,
      customID,
      location: { district, taluka, village, pincode }
    });

    await user.save();
    console.log(`✅ New user registered: ${customID} (${name})`);

    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('❌ Registration error:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this phone or Firebase UID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

/**
 * POST /api/auth/login
 * NOT protected — public endpoint
 *
 * Body: { customID }
 * Returns masked phone so frontend can send OTP
 */
exports.loginWithID = async (req, res) => {
  try {
    const { customID } = req.body;

    if (!customID) {
      return res.status(400).json({
        success: false,
        message: 'CustomID is required'
      });
    }

    const user = await User.findOne({ customID: customID.toUpperCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this ID'
      });
    }

    // Return full phone for Firebase OTP (frontend needs it)
    // Also return masked version for display
    const maskedPhone = user.phone.replace(/.(?=.{4})/g, '*');

    res.status(200).json({
      success: true,
      phone: user.phone,
      maskedPhone,
      name: user.name
    });
  } catch (error) {
    console.error('❌ Login lookup error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * POST /api/auth/verify-login
 * Protected by verifyFirebaseToken
 *
 * After OTP verification, frontend sends the Firebase token here.
 * Backend finds the user by firebaseUID and returns the full profile.
 */
exports.verifyLogin = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.firebaseUID });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('❌ Verify login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login verification failed'
    });
  }
};

/**
 * GET /api/auth/profile
 * Protected by verifyFirebaseToken
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.firebaseUID });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('❌ Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};
