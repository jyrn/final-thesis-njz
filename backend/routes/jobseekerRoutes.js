const express = require('express');
const router = express.Router();
const JobSeeker = require('../models/JobSeeker');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// @route   GET /api/jobseekers/profile
// @desc    Get jobseeker profile
// @access  Private
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    // Get user basic info
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get jobseeker profile
    let jobseekerProfile = await JobSeeker.findOne({ uid });
    
    // If no jobseeker profile exists, create one with basic info
    if (!jobseekerProfile) {
      jobseekerProfile = await JobSeeker.create({
        userId: user._id,
        uid: user.uid,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        email: user.email
      });
    }

    res.json({
      success: true,
      data: {
        ...jobseekerProfile.toObject(),
        completionPercentage: jobseekerProfile.getProfileCompletionPercentage()
      }
    });

  } catch (error) {
    console.error('Get jobseeker profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get jobseeker profile'
    });
  }
});

// @route   PUT /api/jobseekers/profile
// @desc    Update jobseeker profile
// @access  Private
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const updateData = req.body;

    // Find user and jobseeker profile
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let jobseekerProfile = await JobSeeker.findOne({ uid });
    if (!jobseekerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Jobseeker profile not found'
      });
    }

    // Update basic user info if provided
    const userFields = ['firstName', 'lastName', 'middleName'];
    let userUpdated = false;
    userFields.forEach(field => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
        jobseekerProfile[field] = updateData[field]; // Keep in sync
        userUpdated = true;
      }
    });

    if (userUpdated) {
      await user.save();
    }

    // Update jobseeker-specific fields
    const jobseekerFields = [
      'dateOfBirth', 'gender', 'phoneNumber', 'address', 'jobTitle',
      'skills', 'experience', 'education', 'portfolioUrl', 'linkedInUrl',
      'desiredSalaryMin', 'desiredSalaryMax', 'preferredJobTypes',
      'preferredLocations', 'remoteWork', 'profileVisibility',
      'allowContactFromEmployers'
    ];

    jobseekerFields.forEach(field => {
      if (updateData[field] !== undefined) {
        jobseekerProfile[field] = updateData[field];
      }
    });

    await jobseekerProfile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...jobseekerProfile.toObject(),
        completionPercentage: jobseekerProfile.getProfileCompletionPercentage()
      }
    });

  } catch (error) {
    console.error('Update jobseeker profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update jobseeker profile'
    });
  }
});

// @route   POST /api/jobseekers/resume
// @desc    Upload resume
// @access  Private
router.post('/resume', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    const { uid } = req.user;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No resume file provided'
      });
    }

    // Find jobseeker profile
    let jobseekerProfile = await JobSeeker.findOne({ uid });
    if (!jobseekerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Jobseeker profile not found'
      });
    }

    // Update resume URL
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    jobseekerProfile.resumeUrl = resumeUrl;
    await jobseekerProfile.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeUrl: resumeUrl
      }
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload resume'
    });
  }
});

// @route   DELETE /api/jobseekers/resume
// @desc    Delete resume
// @access  Private
router.delete('/resume', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    // Find jobseeker profile
    let jobseekerProfile = await JobSeeker.findOne({ uid });
    if (!jobseekerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Jobseeker profile not found'
      });
    }

    // Remove resume URL
    jobseekerProfile.resumeUrl = null;
    await jobseekerProfile.save();

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete resume'
    });
  }
});

// @route   GET /api/jobseekers/public-profile/:id
// @desc    Get public jobseeker profile (for employers)
// @access  Private
router.get('/public-profile/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const jobseekerProfile = await JobSeeker.findById(id);
    if (!jobseekerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Jobseeker profile not found'
      });
    }

    // Return public profile based on privacy settings
    const publicProfile = jobseekerProfile.getPublicProfile();

    res.json({
      success: true,
      profile: publicProfile
    });

  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get public profile'
    });
  }
});

// @route   POST /api/jobseekers/skills
// @desc    Add or update skills
// @access  Private
router.post('/skills', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        error: 'Skills must be an array'
      });
    }

    let jobseekerProfile = await JobSeeker.findOne({ uid });
    if (!jobseekerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Jobseeker profile not found'
      });
    }

    jobseekerProfile.skills = skills;
    await jobseekerProfile.save();

    res.json({
      success: true,
      message: 'Skills updated successfully',
      skills: jobseekerProfile.skills
    });

  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update skills'
    });
  }
});

// @route   POST /api/jobseekers/experience
// @desc    Add work experience
// @access  Private
router.post('/experience', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const experienceData = req.body;

    let jobseekerProfile = await JobSeeker.findOne({ uid });
    if (!jobseekerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Jobseeker profile not found'
      });
    }

    jobseekerProfile.experience.push(experienceData);
    await jobseekerProfile.save();

    res.json({
      success: true,
      message: 'Experience added successfully',
      experience: jobseekerProfile.experience
    });

  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add experience'
    });
  }
});

// @route   POST /api/jobseekers/education
// @desc    Add education
// @access  Private
router.post('/education', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const educationData = req.body;

    let jobseekerProfile = await JobSeeker.findOne({ uid });
    if (!jobseekerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Jobseeker profile not found'
      });
    }

    jobseekerProfile.education.push(educationData);
    await jobseekerProfile.save();

    res.json({
      success: true,
      message: 'Education added successfully',
      education: jobseekerProfile.education
    });

  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add education'
    });
  }
});

module.exports = router;
