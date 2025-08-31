const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// @route   POST /api/auth/create-profile
// @desc    Create user profile after Firebase registration
// @access  Public (no token required for registration)
router.post('/create-profile', authController.createUserProfile);

// @route   GET /api/auth/verify
// @desc    Verify Firebase token and return user data
// @access  Private (requires Firebase token)
router.get('/verify', authController.verifyToken);

// @route   GET /api/auth/me
// @desc    Get current authenticated user
// @access  Private (requires Firebase token)
router.get('/me', verifyToken, authController.getCurrentUser);

// @route   GET /api/auth/verify-email/:token
// @desc    Verify user email with token
// @access  Public
router.get('/verify-email/:token', authController.verifyEmail);

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Public
router.post('/resend-verification', authController.resendVerification);

// @route   GET /api/auth/check-email/:email
// @desc    Check if email exists and get verification status
// @access  Public
router.get('/check-email/:email', authController.checkEmailExists);

// @route   GET /api/auth/check-email/:email?role=:role
// @desc    Check if email exists with role parameter
// @access  Public
router.get('/check-email/:email', authController.checkEmailExists);

module.exports = router;
