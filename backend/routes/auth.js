const express = require('express');
const { firebaseAuth, optionalAuth } = require('../middleware/firebaseAuth');
const { verifyIdToken, getUserByUid } = require('../config/firebase');
const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user with Firebase authentication and create MongoDB profile
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { idToken, fullName, role, additionalData } = req.body;

    // Validate required fields
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required'
      });
    }

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    if (!role || !['job_seeker', 'employer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role (job_seeker or employer) is required'
      });
    }

    // Verify Firebase token
    const decodedToken = await verifyIdToken(idToken);
    const firebaseUser = await getUserByUid(decodedToken.uid);

    // Check if user already exists in MongoDB
    let existingUser = await User.findOne({ 
      $or: [
        { firebaseUid: firebaseUser.uid },
        { email: firebaseUser.email }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        data: {
          id: existingUser._id,
          email: existingUser.email,
          role: existingUser.role
        }
      });
    }

    // Create new user in MongoDB
    const newUser = new User({
      name: fullName,
      email: firebaseUser.email,
      role: role,
      firebaseUid: firebaseUser.uid,
      emailVerified: firebaseUser.emailVerified,
      photoURL: firebaseUser.photoURL || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newUser.save();

    // Create role-specific profile
    let profile = null;
    
    if (role === 'job_seeker') {
      profile = new JobSeeker({
        userId: newUser._id,
        skills: additionalData?.skills || [],
        experience: additionalData?.experience || [],
        education: additionalData?.education || [],
        resume: additionalData?.resume || null,
        portfolio: additionalData?.portfolio || null,
        location: additionalData?.location || '',
        phoneNumber: additionalData?.phoneNumber || '',
        dateOfBirth: additionalData?.dateOfBirth || null,
        gender: additionalData?.gender || '',
        availability: additionalData?.availability || 'available'
      });
    } else if (role === 'employer') {
      profile = new Employer({
        userId: newUser._id,
        companyName: additionalData?.companyName || '',
        companyDescription: additionalData?.companyDescription || '',
        industry: additionalData?.industry || '',
        companySize: additionalData?.companySize || '',
        website: additionalData?.website || '',
        location: additionalData?.location || '',
        phoneNumber: additionalData?.phoneNumber || '',
        establishedYear: additionalData?.establishedYear || null,
        companyType: additionalData?.companyType || ''
      });
    }

    if (profile) {
      await profile.save();
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          firebaseUid: newUser.firebaseUid,
          emailVerified: newUser.emailVerified,
          photoURL: newUser.photoURL,
          createdAt: newUser.createdAt
        },
        profile: profile
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
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

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user with Firebase authentication and return MongoDB profile
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required'
      });
    }

    // Verify Firebase token
    const decodedToken = await verifyIdToken(idToken);
    const firebaseUser = await getUserByUid(decodedToken.uid);

    // Find user in MongoDB
    const user = await User.findOne({ firebaseUid: firebaseUser.uid });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database. Please register first.',
        code: 'USER_NOT_REGISTERED'
      });
    }

    // Update user's last login and email verification status
    user.lastLoginAt = new Date();
    user.emailVerified = firebaseUser.emailVerified;
    if (firebaseUser.photoURL) {
      user.photoURL = firebaseUser.photoURL;
    }
    await user.save();

    // Get user profile based on role
    let profile = null;
    
    if (user.role === 'job_seeker') {
      profile = await JobSeeker.findOne({ userId: user._id });
    } else if (user.role === 'employer') {
      profile = await Employer.findOne({ userId: user._id });
    }

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          firebaseUid: user.firebaseUid,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        },
        profile: profile,
        firebaseUser: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
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

    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        success: false,
        message: 'Firebase user not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile (requires Firebase authentication)
 * @access  Private
 */
router.get('/me', firebaseAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    // Get user profile based on role
    let profile = null;
    
    if (req.user.role === 'job_seeker') {
      profile = await JobSeeker.findOne({ userId: req.user._id });
    } else if (req.user.role === 'employer') {
      profile = await Employer.findOne({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          firebaseUid: req.user.firebaseUid,
          emailVerified: req.user.emailVerified,
          photoURL: req.user.photoURL,
          createdAt: req.user.createdAt,
          lastLoginAt: req.user.lastLoginAt
        },
        profile: profile,
        firebaseUser: req.firebaseUser
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (optional - mainly for logging purposes)
 * @access  Private
 */
router.post('/logout', optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      // Update last logout time
      req.user.lastLogoutAt = new Date();
      await req.user.save();
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

/**
 * @route   DELETE /api/auth/delete-account
 * @desc    Delete user account from both Firebase and MongoDB
 * @access  Private
 */
router.delete('/delete-account', firebaseAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found in database'
      });
    }

    const userId = req.user._id;
    const firebaseUid = req.user.firebaseUid;

    // Delete role-specific profile
    if (req.user.role === 'job_seeker') {
      await JobSeeker.deleteOne({ userId: userId });
    } else if (req.user.role === 'employer') {
      await Employer.deleteOne({ userId: userId });
    }

    // Delete user from MongoDB
    await User.deleteOne({ _id: userId });

    // Delete user from Firebase (optional - you might want to keep Firebase user)
    // await deleteUser(firebaseUid);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during account deletion'
    });
  }
});

module.exports = router;
