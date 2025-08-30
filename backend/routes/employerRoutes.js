const express = require('express');
const router = express.Router();
const Employer = require('../models/Employer');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleBasedAccess');

// GET /api/employers/account-status - Get employer account verification status
router.get('/account-status', verifyToken, requireRole('employer'), async (req, res) => {
  try {
    const employer = await Employer.findOne({ uid: req.user.uid });
    
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        accountStatus: employer.accountStatus,
        isVerified: employer.accountStatus === 'verified',
        profileComplete: employer.profileComplete,
        verificationNotes: employer.verificationNotes,
        verifiedAt: employer.verifiedAt,
        canPostJobs: employer.canPerform('post_jobs')
      }
    });
  } catch (error) {
    console.error('Error fetching employer account status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching account status',
      error: error.message
    });
  }
});

// GET /api/employers/profile - Get employer profile
router.get('/profile', verifyToken, requireRole('employer'), async (req, res) => {
  try {
    const employer = await Employer.findOne({ uid: req.user.uid });
    
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    res.json({
      success: true,
      data: employer.getPublicProfile()
    });
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// PUT /api/employers/profile - Update employer profile
router.put('/profile', verifyToken, requireRole('employer'), async (req, res) => {
  try {
    const employer = await Employer.findOne({ uid: req.user.uid });
    
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found'
      });
    }

    const {
      companyName,
      companyDescription,
      industry,
      companySize,
      foundedYear,
      website,
      contactPerson,
      address,
      socialMedia,
      benefits,
      companyValues,
      workEnvironment
    } = req.body;

    // Update fields if provided
    if (companyName) employer.companyName = companyName;
    if (companyDescription) employer.companyDescription = companyDescription;
    if (industry) employer.industry = industry;
    if (companySize) employer.companySize = companySize;
    if (foundedYear) employer.foundedYear = foundedYear;
    if (website) employer.website = website;
    if (contactPerson) employer.contactPerson = { ...employer.contactPerson, ...contactPerson };
    if (address) employer.address = { ...employer.address, ...address };
    if (socialMedia) employer.socialMedia = { ...employer.socialMedia, ...socialMedia };
    if (benefits) employer.benefits = benefits;
    if (companyValues) employer.companyValues = companyValues;
    if (workEnvironment) employer.workEnvironment = workEnvironment;

    await employer.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: employer.getPublicProfile()
    });
  } catch (error) {
    console.error('Error updating employer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

module.exports = router;
