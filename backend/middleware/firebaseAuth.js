const admin = require('../config/firebase');
const User = require('../models/User');

/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID token and attaches user info to request
 */
const firebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header with Bearer token is required'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'Firebase ID token is required'
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Get Firebase user details
    const firebaseUser = await admin.auth().getUser(decodedToken.uid);
    
    // Find corresponding user in MongoDB
    const mongoUser = await User.findOne({ firebaseUid: decodedToken.uid });
    
    // Attach user info to request object
    req.firebaseUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      disabled: firebaseUser.disabled,
      customClaims: firebaseUser.customClaims || {}
    };
    
    req.user = mongoUser; // MongoDB user (may be null for new users)
    req.decodedToken = decodedToken;
    
    next();
    
  } catch (error) {
    console.error('Firebase authentication error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Firebase ID token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase ID token',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.code === 'auth/user-not-found') {
      return res.status(401).json({
        success: false,
        message: 'Firebase user not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      code: 'SERVER_ERROR'
    });
  }
};

/**
 * Role-based authorization middleware
 * Requires firebaseAuth middleware to be used first
 */
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found in database'
        });
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        });
      }
      
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during authorization'
      });
    }
  };
};

/**
 * Optional authentication middleware
 * Attaches user info if token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.firebaseUser = null;
      req.user = null;
      return next();
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      req.firebaseUser = null;
      req.user = null;
      return next();
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUser = await admin.auth().getUser(decodedToken.uid);
    const mongoUser = await User.findOne({ firebaseUid: decodedToken.uid });
    
    req.firebaseUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      disabled: firebaseUser.disabled,
      customClaims: firebaseUser.customClaims || {}
    };
    
    req.user = mongoUser;
    req.decodedToken = decodedToken;
    
    next();
    
  } catch (error) {
    // If token verification fails, continue without authentication
    console.warn('Optional auth failed:', error.message);
    req.firebaseUser = null;
    req.user = null;
    next();
  }
};

module.exports = {
  firebaseAuth,
  requireRole,
  optionalAuth
};
