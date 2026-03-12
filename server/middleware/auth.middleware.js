const admin = require('firebase-admin');
const User = require('../models/User.model');

/**
 * Protect routes — verify Firebase ID token and attach user to request.
 * Replaces old JWT-based protect middleware.
 * Sets req.user (full Mongoose document) and req.firebaseUID.
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided'
      });
    }

    try {
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.firebaseUID = decodedToken.uid;
      req.firebasePhone = decodedToken.phone_number || null;

      // Lookup user in MongoDB by firebaseUID
      const user = await User.findOne({ firebaseUID: decodedToken.uid });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found in database'
        });
      }

      // Attach full user document to request (needed by controllers that use req.user._id, req.user.role, etc.)
      req.user = user;
      next();
    } catch (error) {
      console.log('❌ Firebase token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized — invalid token'
      });
    }
  } catch (error) {
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
