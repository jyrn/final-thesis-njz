const { verifyIdToken, getUserByUid } = require('../config/firebase');
const User = require('../models/User');

/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID token and attaches user data to request
 */
const firebaseAuth = async (req, res, next) => {
  try {
    // Get the Firebase ID token from the Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No Firebase ID token provided.'
      });
    }

    // Extract the token (remove 'Bearer ' prefix)
    const idToken = authHeader.substring(7);

    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(idToken);
    
    // Get Firebase user record
    const firebaseUser = await getUserByUid(decodedToken.uid);

    // Find or create user in our database
    let user = await User.findOne({ email: firebaseUser.email });
    
    if (!user) {
      // Create new user in our database if they don't exist
      user = new User({
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        role: 'job_seeker', // Default role, can be updated later
        firebaseUid: firebaseUser.uid // Store Firebase UID for reference
      });
      
      await user.save();
    }

    // Attach user data to request object
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      firebaseUid: firebaseUser.uid
    };

    // Attach Firebase user data for additional context
    req.firebaseUser = firebaseUser;

    next();
  } catch (error) {
    console.error('Firebase authentication error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Firebase ID token has expired'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        message: 'Firebase ID token has been revoked'
      });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase ID token'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional Firebase Authentication Middleware
 * Similar to firebaseAuth but doesn't return error if no token provided
 * Useful for routes that can work with or without authentication
 */
const optionalFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      req.firebaseUser = null;
      return next();
    }

    // Extract and verify token
    const idToken = authHeader.substring(7);
    const decodedToken = await verifyIdToken(idToken);
    const firebaseUser = await getUserByUid(decodedToken.uid);

    // Find user in our database
    const user = await User.findOne({ email: firebaseUser.email });
    
    if (user) {
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        firebaseUid: firebaseUser.uid
      };
      req.firebaseUser = firebaseUser;
    } else {
      req.user = null;
      req.firebaseUser = null;
    }

    next();
  } catch (error) {
    console.error('Optional Firebase authentication error:', error);
    // Continue without authentication on error
    req.user = null;
    req.firebaseUser = null;
    next();
  }
};

/**
 * Role-based Authorization Middleware
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the route
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

module.exports = {
  firebaseAuth,
  optionalFirebaseAuth,
  requireRole
}; 