const express = require('express');
const router = express.Router();
const JobSeeker = require('../models/JobSeeker');
const User = require('../models/User');
const ParsedResume = require('../models/ParsedResume');
const Resume = require('../models/Resume');
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

// @route   POST /api/jobseekers/resume-data
// @desc    Save resume data to jobseeker profile
// @access  Private
router.post('/resume-data', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { resumeData } = req.body;

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        error: 'Resume data is required'
      });
    }

    // Find and update jobseeker profile with resume data
    const jobSeeker = await JobSeeker.findOneAndUpdate(
      { uid },
      { 
        resumeData: {
          ...resumeData,
          uploadedAt: new Date()
        }
      },
      { new: true, upsert: false }
    );

    if (!jobSeeker) {
      return res.status(404).json({
        success: false,
        error: 'JobSeeker profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Resume data saved successfully',
      data: {
        resumeData: jobSeeker.resumeData
      }
    });

  } catch (error) {
    console.error('Error saving resume data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save resume data'
    });
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
// @desc    Upload resume file and initiate parsing
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

    // Step 1: Store file in Resume collection
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    
    // Deactivate previous resumes
    await Resume.updateMany(
      { jobSeekerUid: uid, isActive: true },
      { isActive: false }
    );

    // Create new resume record
    const resumeRecord = new Resume({
      jobSeekerUid: uid,
      jobSeekerId: jobseekerProfile._id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      fileUrl: resumeUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      processingStatus: 'processing',
      isActive: true
    });
    await resumeRecord.save();

    // Step 2: Parse resume using working parser service
    let parsedData = null;
    try {
      const fs = require('fs');
      const fetch = require('node-fetch');
      
      console.log('📤 Starting resume parsing...');
      
      // Read the PDF file and convert to base64
      const pdfBuffer = fs.readFileSync(req.file.path);
      const pdfBase64 = pdfBuffer.toString('base64');
      
      console.log('📄 PDF converted to base64, length:', pdfBase64.length);
      
      const nerResponse = await fetch('http://localhost:5000/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdf_base64: pdfBase64
        })
      });
      
      console.log('📥 Parser response status:', nerResponse.status);
      
      if (nerResponse.ok) {
        const parseResult = await nerResponse.json();
        console.log('📊 Parser result:', parseResult);
        
        if (parseResult.success) {
          parsedData = parseResult.data;
          console.log('✅ Successfully parsed resume data:', {
            name: parsedData.name,
            email: parsedData.email,
            skillsCount: parsedData.skills?.length || 0,
            experienceCount: parsedData.experience?.length || 0
          });
          
          // Update resume processing status and save extracted text
          resumeRecord.processingStatus = 'completed';
          resumeRecord.processedAt = new Date();
          resumeRecord.extractedText = parseResult.data.extractedText || '';
          
          // Add processing log entry
          resumeRecord.addProcessingLog('completed', 'Resume parsed successfully', {
            skillsCount: parseResult.data.skills?.length || 0,
            experienceCount: parseResult.data.experience?.length || 0,
            educationCount: parseResult.data.education?.length || 0,
            confidence: parseResult.data.confidence
          });
          
          await resumeRecord.save();
        } else {
          console.log('❌ Parser returned success=false:', parseResult);
          throw new Error(parseResult.error || 'Parser failed');
        }
      } else {
        const errorText = await nerResponse.text();
        console.log('❌ Parser request failed:', nerResponse.status, errorText);
        throw new Error(`Parser request failed: ${nerResponse.status}`);
      }
    } catch (parseError) {
      console.error('❌ Resume parsing error:', parseError.message);
      resumeRecord.processingStatus = 'failed';
      resumeRecord.addProcessingLog('failed', 'Resume parsing failed', {
        error: parseError.message
      });
      await resumeRecord.save();
    }

    // Update jobseeker profile with resume URL
    jobseekerProfile.resumeUrl = resumeUrl;
    await jobseekerProfile.save();

    console.log('📤 Sending response to frontend:', {
      resumeId: resumeRecord._id,
      resumeUrl: resumeUrl,
      parsedDataExists: !!parsedData,
      parsedDataKeys: parsedData ? Object.keys(parsedData) : []
    });

    // Step 3: Return parsed data for edit modal (don't save to ParsedResume yet)
    res.json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: {
        resumeId: resumeRecord._id,
        resumeUrl: resumeUrl,
        parsedData: parsedData // This will be shown in edit modal
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

// @route   POST /api/jobseekers/resume/confirm
// @desc    Save user-confirmed parsed data to ParsedResume collection
// @access  Private
router.post('/resume/confirm', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { resumeId, parsedData } = req.body;

    if (!resumeId || !parsedData) {
      return res.status(400).json({
        success: false,
        error: 'Resume ID and parsed data are required'
      });
    }

    // Find the resume record
    const resumeRecord = await Resume.findOne({ 
      _id: resumeId, 
      jobSeekerUid: uid 
    });

    if (!resumeRecord) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Find jobseeker profile
    const jobseekerProfile = await JobSeeker.findOne({ uid });
    if (!jobseekerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Jobseeker profile not found'
      });
    }

    // Step 4: Save user-confirmed data to ParsedResume collection
    const parsedResumeData = {
      userId: uid,
      resumeId: resumeRecord._id,
      personalInfo: parsedData.personalInfo || {},
      skills: parsedData.skills || [],
      languages: parsedData.languages || [],
      experience: parsedData.experience || [],
      education: parsedData.education || [],
      certifications: parsedData.certifications || [],
      trainings: parsedData.trainings || [],
      parsingMetadata: {
        parsedAt: new Date(),
        parsingVersion: '2.0',
        confidence: 0.95, // Higher confidence since user confirmed
        extractionMethod: 'enhanced_ner_user_confirmed'
      },
      industryTags: [],
      experienceLevel: parsedData.experienceLevel || 'entry'
    };

    // Remove existing ParsedResume for this user (keep only latest)
    await ParsedResume.deleteMany({ userId: uid });

    // Save new ParsedResume
    const parsedResume = new ParsedResume(parsedResumeData);
    await parsedResume.save();

    // Also update JobSeeker profile with confirmed data
    jobseekerProfile.resumeData = {
      ...parsedData,
      uploadedAt: resumeRecord.uploadedAt,
      confirmedAt: new Date()
    };
    await jobseekerProfile.save();

    res.json({
      success: true,
      message: 'Resume data confirmed and saved successfully',
      data: {
        parsedResumeId: parsedResume._id,
        resumeData: parsedData
      }
    });

  } catch (error) {
    console.error('Resume confirmation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to confirm resume data'
    });
  }
});

// @route   GET /api/jobseekers/resume/view
// @desc    Get resume file for viewing
// @access  Private
router.get('/resume/view', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    // Find jobseeker profile
    const jobseekerProfile = await JobSeeker.findOne({ uid });
    if (!jobseekerProfile || !jobseekerProfile.resumeUrl) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Return the resume URL for frontend to display
    res.json({
      success: true,
      data: {
        resumeUrl: jobseekerProfile.resumeUrl,
        resumeData: jobseekerProfile.resumeData
      }
    });

  } catch (error) {
    console.error('Resume view error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get resume'
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
