const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');
const {
    registerUser,
    loginWithID,
    verifyLogin,
    getUserProfile
} = require('../controllers/auth.controller');

// Registration — Firebase token required (OTP already verified on frontend)
router.post('/register', verifyFirebaseToken, registerUser);

// Login step 1 — Lookup phone by customID (public, no auth)
router.post('/login', loginWithID);

// Login step 2 — Verify Firebase token after OTP (proves phone ownership)
router.post('/verify-login', verifyFirebaseToken, verifyLogin);

// Get user profile (protected)
router.get('/profile', verifyFirebaseToken, getUserProfile);

module.exports = router;
