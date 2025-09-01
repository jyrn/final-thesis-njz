const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has admin or superadmin role
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Check if user account is active and verified
    if (!req.user.isActive || req.user.registrationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Admin account not verified or inactive'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in admin authorization'
    });
  }
};

const superAdminMiddleware = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has superadmin role
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Super admin access required'
      });
    }

    // Check if user account is active and verified
    if (!req.user.isActive || req.user.registrationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Super admin account not verified or inactive'
      });
    }

    next();
  } catch (error) {
    console.error('Super admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in super admin authorization'
    });
  }
};

module.exports = {
  adminMiddleware,
  superAdminMiddleware
};
