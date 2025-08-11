const express = require('express');
const { firebaseAuth, requireRole } = require('../middleware/firebaseAuth');
const { getUserByUid, createCustomToken } = require('../config/firebase');
const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');
const Admin = require('../models/Admin');

const router = express.Router();

/**
 * @route   POST /api/firebase-auth/verify
 * @desc    Verify Firebase ID token and return user data
 * @access  Public
 */
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required'
      });
    }

    // Import verifyIdToken here to avoid circular dependency
    const { verifyIdToken } = require('../config/firebase');
    const decodedToken = await verifyIdToken(idToken);
    const firebaseUser = await getUserByUid(decodedToken.uid);

    // Find or create user in our database
    let user = await User.findOne({ email: firebaseUser.email });
    
    if (!user) {
      // Create new user in our database
      user = new User({
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        role: 'job_seeker', // Default role
        firebaseUid: firebaseUser.uid
      });
      
      await user.save();
    }

    // Get user profile based on role
    let profile = null;
    
    if (user.role === 'job_seeker') {
      profile = await JobSeeker.findOne({ userId: user._id });
    } else if (user.role === 'employer') {
      profile = await Employer.findOne({ userId: user._id });
    } else if (user.role === 'admin') {
      profile = await Admin.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          firebaseUid: firebaseUser.uid,
          createdAt: user.createdAt
        },
        profile,
        firebaseUser: {
          uid: firebaseUser.uid,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        }
      }
    });

  } catch (error) {
    console.error('Firebase verification error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Firebase ID token has expired'
      });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid Firebase ID token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
});

/**
 * @route   POST /api/firebase-auth/create-profile
 * @desc    Create user profile in MongoDB after Firebase registration
 * @access  Private (requires Firebase authentication)
 */
router.post('/create-profile', firebaseAuth, async (req, res) => {
  try {
    const { fullName, role } = req.body;

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    // Check if user already exists in MongoDB
    let user = await User.findOne({ email: req.firebaseUser.email });
    
    if (user) {
      return res.status(200).json({
        success: true,
        message: 'User profile already exists',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          firebaseUid: user.firebaseUid
        }
      });
    }

    // Create new user in MongoDB
    user = new User({
      name: fullName,
      email: req.firebaseUser.email,
      role: role || 'job_seeker',
      firebaseUid: req.firebaseUser.uid
    });
    
    await user.save();

    // Create role-specific profile
    let profile = null;
    if (user.role === 'job_seeker') {
      profile = new JobSeeker({
        userId: user._id,
        skills: [],
        experience: [],
        education: []
      });
      await profile.save();
    } else if (user.role === 'employer') {
      profile = new Employer({
        userId: user._id,
        companyName: '',
        companyDescription: '',
        industry: '',
        companySize: ''
      });
      await profile.save();
    }

    res.status(201).json({
      success: true,
      message: 'User profile created successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid,
        profile: profile
      }
    });

  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile creation'
    });
  }
});

/**
 * @route   GET /api/firebase-auth/me
 * @desc    Get current user profile (requires Firebase authentication)
 * @access  Private
 */
router.get('/me', firebaseAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user profile based on role
    let profile = null;
    
    if (user.role === 'job_seeker') {
      profile = await JobSeeker.findOne({ userId: user._id });
    } else if (user.role === 'employer') {
      profile = await Employer.findOne({ userId: user._id });
    } else if (user.role === 'admin') {
      profile = await Admin.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          firebaseUid: user.firebaseUid,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        profile,
        firebaseUser: {
          uid: req.firebaseUser.uid,
          emailVerified: req.firebaseUser.emailVerified,
          displayName: req.firebaseUser.displayName,
          photoURL: req.firebaseUser.photoURL
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   PUT /api/firebase-auth/update-role
 * @desc    Update user role (requires admin privileges)
 * @access  Private (Admin only)
 */
router.put('/update-role', firebaseAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    if (!userId || !newRole) {
      return res.status(400).json({
        success: false,
        message: 'User ID and new role are required'
      });
    }

    if (!['job_seeker', 'employer', 'admin'].includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be job_seeker, employer, or admin'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = newRole;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @route   POST /api/firebase-auth/create-custom-token
 * @desc    Create custom token for testing (admin only)
 * @access  Private (Admin only)
 */
router.post('/create-custom-token', firebaseAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { uid, additionalClaims } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'Firebase UID is required'
      });
    }

    const customToken = await createCustomToken(uid, additionalClaims || {});

    res.json({
      success: true,
      message: 'Custom token created successfully',
      data: {
        customToken
      }
    });

  } catch (error) {
    console.error('Create custom token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 