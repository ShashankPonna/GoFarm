const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');
const {
    registerUser,
    loginWithID,
    verifyLogin,
    getUserProfile,
    sendOTP,
    verifyOTP
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public OTP endpoints (Twilio Verify)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Registration — Firebase token required (OTP already verified on frontend)
router.post('/register', verifyFirebaseToken, registerUser);

// Login step 1 — Lookup phone by customID (public, no auth)
router.post('/login', loginWithID);

// Login step 2 — Verify Firebase token after OTP (proves phone ownership)
router.post('/verify-login', verifyFirebaseToken, verifyLogin);

// Get user profile (protected - Supports Hybrid Auth)
router.get('/profile', protect, getUserProfile);

module.exports = router;
