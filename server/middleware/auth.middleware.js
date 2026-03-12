const admin = require('firebase-admin');
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

/**
 * Protect routes — verify Firebase ID token OR Custom JWT and attach user to request.
 * Sets req.user (full Mongoose document).
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('🔒 [AuthMiddleware] No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided'
      });
    }

    // --- TRY FIREBASE VERIFICATION FIRST ---
    try {
      const decodedFirebase = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ firebaseUID: decodedFirebase.uid });
      
      if (user) {
        console.log('🔒 [AuthMiddleware] Firebase Token Verified for:', user.customID);
        req.firebaseUID = decodedFirebase.uid;
        req.user = user;
        return next();
      }
    } catch (firebaseError) {
      // If Firebase fails, we proceed to check if it's a custom JWT
      // console.log('Firebase verification failed, trying JWT...');
    }

    // --- TRY CUSTOM JWT VERIFICATION ---
    try {
      console.log('🔒 [AuthMiddleware] Attempting Custom JWT verification...');
      const decodedJWT = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔒 [AuthMiddleware] JWT Decoded Successfully:', JSON.stringify(decodedJWT));
      
      const user = await User.findById(decodedJWT.id);

      if (user) {
        console.log('🔒 [AuthMiddleware] JWT Verified for:', user.customID);
        req.user = user;
        return next();
      } else {
        console.log('🔒 [AuthMiddleware] User not found for ID:', decodedJWT.id);
      }
    } catch (jwtError) {
      console.log('🔒 [AuthMiddleware] JWT Verification Failed:', jwtError.message);
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid or expired token'
    });
  } catch (error) {
    console.error('🔒 [AuthMiddleware] Unknown Error:', error);
    next(error);
  }
};

/**
 * Authorize specific roles.
 * Must be used AFTER protect middleware.
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
