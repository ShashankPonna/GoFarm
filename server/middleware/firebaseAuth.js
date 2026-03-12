const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    try {
      // Method 1: Load from service account JSON file
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        || path.join(__dirname, '../config/firebase-service-account.json');

      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin SDK initialized (from service account JSON)');
        return true;
      }

      // Method 2: Load from individual env vars
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
        console.log('✅ Firebase Admin SDK initialized (from env vars)');
        return true;
      }

      console.warn('⚠️  No Firebase credentials found. Provide either:');
      console.warn('    - FIREBASE_SERVICE_ACCOUNT_PATH in .env (or place firebase-service-account.json in server/config/)');
      console.warn('    - FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env');
      return false;
    } catch (error) {
      console.warn('⚠️  Firebase initialization failed:', error.message);
      return false;
    }
  }
  return true;
};

/**
 * Middleware: Verify Firebase ID Token
 * Extracts Bearer token, verifies with Firebase Admin,
 * and sets req.firebaseUID + req.firebasePhone.
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No valid authorization token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Bearer <token>',
        code: 'INVALID_FORMAT'
      });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    // Attach Firebase identity to request
    req.firebaseUID = decoded.uid;
    req.firebasePhone = decoded.phone_number || null;

    next();
  } catch (error) {
    console.error('🔒 Firebase token verification failed:', error.message);

    const isExpired = error.code === 'auth/id-token-expired';
    return res.status(401).json({
      success: false,
      message: isExpired ? 'Token expired, please re-authenticate' : 'Invalid token',
      code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
    });
  }
};

module.exports = {
  initializeFirebase,
  verifyFirebaseToken
};
