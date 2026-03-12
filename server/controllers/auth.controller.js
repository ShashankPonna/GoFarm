const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

// Initialize Twilio client
const client = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

/**
 * Generate JWT for the user
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

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
 * POST /api/auth/send-otp
 * Body: { phone }
 */
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Verify if user exists first (for Login flow)
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this phone number. Please register first.'
      });
    }

    // Mock Mode Logic
    if (!client || !VERIFY_SERVICE_SID) {
      console.log(`[MOCK MODE] OTP sent to ${phone}: 123456`);
      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully (Mock Mode)',
        mock: true,
        name: user.name // Return name for personalized welcome
      });
    }

    const verification = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verifications.create({ to: `+91${phone}`, channel: 'sms' });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      status: verification.status,
      name: user.name // Return name for personalized welcome
    });
  } catch (error) {
    console.error('❌ Twilio Send OTP Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again later.'
    });
  }
};

/**
 * POST /api/auth/verify-otp
 * Body: { phone, otp, userData (optional for registration) }
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, userData } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    let isVerified = false;

    // Mock Mode Logic
    if (!client || !VERIFY_SERVICE_SID) {
      if (otp === '123456') isVerified = true;
    } else {
      const verificationCheck = await client.verify.v2
        .services(VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: `+91${phone}`, code: otp });
      
      if (verificationCheck.status === 'approved') isVerified = true;
    }

    if (!isVerified) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP Approved -> Find or Create User
    let user = await User.findOne({ phone });

    if (!user && userData) {
      // Registration flow
      const { name, role, district, taluka, village, pincode } = userData;
      
      // Basic validation
      if (!name || !role || !district || !taluka || !village || !pincode) {
        return res.status(400).json({ success: false, message: 'Incomplete registration data' });
      }

      const customID = await generateCustomID(role);
      
      user = new User({
        firebaseUID: `twilio_${phone}`, // Place-holder for consistency
        name,
        phone,
        role,
        customID,
        location: { district, taluka, village, pincode }
      });

      await user.save();
      console.log(`✅ New user registered via Twilio: ${customID}`);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.',
        isNotRegistered: true
      });
    }

    // Generate custom JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      user,
      token,
      message: 'Authentication successful'
    });
  } catch (error) {
    console.error('❌ Twilio Verify OTP Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Verification failed. Please try again.'
    });
  }
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
 * Protected by verifyFirebaseToken OR protect (Hybrid)
 */
exports.getUserProfile = async (req, res) => {
  try {
    // req.user is attached by authMiddleware.protect
    // req.firebaseUID is attached by firebaseAuth.verifyFirebaseToken
    const query = req.user ? { _id: req.user._id } : { firebaseUID: req.firebaseUID };
    
    const user = await User.findOne(query);

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

