const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/authMiddleware');

// Application Schema
const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Job'
  },
  jobSeekerUid: {
    type: String,
    required: true
  },
  employerUid: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'interview', 'hired', 'rejected'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  resumeData: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      address: String
    },
    summary: String,
    skills: [String],
    experience: [{
      company: String,
      position: String,
      duration: String,
      description: String
    }],
    education: [{
      institution: String,
      degree: String,
      year: String
    }],
    certifications: [String]
  },
  coverLetter: String,
  notes: String,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Application = mongoose.model('Application', ApplicationSchema);

// @route   POST /api/applications
// @desc    Submit job application
// @access  Private (Job Seeker)
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('=== APPLICATION SUBMISSION START ===');
    const { jobId, resumeData, coverLetter } = req.body;
    const { uid } = req.user;

    console.log('Request body keys:', Object.keys(req.body));
    console.log('JobId:', jobId);
    console.log('User UID:', uid);
    console.log('Has resume data:', !!resumeData);
    console.log('Has cover letter:', !!coverLetter);

    if (!jobId) {
      console.error('Missing jobId in request');
      return res.status(400).json({
        success: false,
        error: 'Job ID is required'
      });
    }

    if (!uid) {
      console.error('Missing uid in token');
      return res.status(401).json({
        success: false,
        error: 'User authentication failed'
      });
    }

    // Get job details to find employer
    const Job = require('../models/Job');
    console.log('Looking up job with ID:', jobId);
    
    const job = await Job.findById(jobId);
    console.log('Job lookup result:', job ? {
      id: job._id,
      title: job.title,
      employerUid: job.employerUid,
      employerId: job.employerId
    } : 'NOT FOUND');
    
    if (!job) {
      console.error('Job not found for ID:', jobId);
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if user already applied to this job
    console.log('Checking for existing application...');
    const existingApplication = await Application.findOne({
      jobId,
      jobSeekerUid: uid
    });
    console.log('Existing application found:', !!existingApplication);

    if (existingApplication) {
      console.log('User already applied to this job');
      return res.status(400).json({
        success: false,
        error: 'You have already applied to this job'
      });
    }

    // Create application
    console.log('Creating new application...');
    
    // Handle missing employerUid field in existing jobs
    let employerIdentifier = 'unknown';
    if (job.employerUid) {
      employerIdentifier = job.employerUid;
    } else if (job.employerId) {
      employerIdentifier = job.employerId;
    }
    
    console.log('Using employer identifier:', employerIdentifier);
    
    // Get job seeker profile to ensure we have the correct name
    const JobSeeker = require('../models/JobSeeker');
    const jobSeekerProfile = await JobSeeker.findOne({ uid });
    
    // Enhance resume data with profile information
    const enhancedResumeData = {
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        // Use profile name if resume parsing failed
        name: resumeData.personalInfo?.name || 
              (jobSeekerProfile ? `${jobSeekerProfile.firstName} ${jobSeekerProfile.lastName}` : 'Unknown Applicant'),
        email: resumeData.personalInfo?.email || jobSeekerProfile?.email || ''
      }
    };
    
    console.log('Enhanced resume data with name:', enhancedResumeData.personalInfo.name);
    
    const applicationData = {
      jobId,
      jobSeekerUid: uid,
      employerUid: employerIdentifier,
      resumeData: enhancedResumeData,
      coverLetter,
      status: 'pending',
      // Store applicant info for easy access
      applicantName: enhancedResumeData.personalInfo.name,
      applicantEmail: enhancedResumeData.personalInfo.email,
      applicantPhone: enhancedResumeData.personalInfo.phone || jobSeekerProfile?.phone || '',
      applicantAddress: enhancedResumeData.personalInfo.address || jobSeekerProfile?.address || ''
    };
    
    console.log('Application data to save:', JSON.stringify(applicationData, null, 2));
    
    const application = new Application(applicationData);
    
    console.log('Attempting to save application...');
    await application.save();
    console.log('Application saved successfully with ID:', application._id);

    // Update job applicant count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicantCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application._id,
        status: application.status,
        appliedDate: application.appliedDate
      }
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      jobId,
      uid,
      resumeData: resumeData ? 'present' : 'missing'
    });
    res.status(500).json({
      success: false,
      error: 'Failed to submit application',
      details: error.message
    });
  }
});

// @route   GET /api/applications/employer
// @desc    Get applications for employer's jobs
// @access  Private (Employer)
router.get('/employer', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { status, jobId } = req.query;

    console.log('=== EMPLOYER APPLICATIONS REQUEST ===');
    console.log('Employer UID:', uid);
    console.log('Query filters:', { status, jobId });

    // First, let's see all applications in the database
    const allApplications = await Application.find({});
    console.log('Total applications in database:', allApplications.length);
    
    allApplications.forEach((app, index) => {
      console.log(`App ${index + 1}:`, {
        id: app._id,
        employerUid: app.employerUid,
        employerId: app.employerId,
        jobSeekerUid: app.jobSeekerUid,
        applicantName: app.resumeData?.personalInfo?.name || 'No name',
        status: app.status,
        appliedDate: app.appliedDate
      });
    });

    // Build query using clean employerUid field
    const query = {
      employerUid: uid
    };
    if (status) query.status = status;
    if (jobId) query.jobId = jobId;

    console.log('MongoDB query:', JSON.stringify(query, null, 2));
    console.log('Looking for employer UID:', uid);

    const applications = await Application.find(query)
      .populate('jobId', 'title location type salary companyName')
      .sort({ appliedDate: -1 });

    console.log('Applications found:', applications.length);
    console.log('Applications data:', applications.map(app => ({
      id: app._id,
      jobTitle: app.jobId?.title,
      status: app.status,
      appliedDate: app.appliedDate
    })));

    // Format applications for frontend
    const formattedApplications = applications.map(app => {
      console.log('Processing application:', {
        id: app._id,
        jobTitle: app.jobId?.title,
        hasResumeData: !!app.resumeData,
        resumeDataKeys: app.resumeData ? Object.keys(app.resumeData) : [],
        personalInfo: app.resumeData?.personalInfo
      });

      return {
        _id: app._id, // Add _id for compatibility
        id: app._id,
        jobId: app.jobId?._id,
        jobTitle: app.jobId?.title,
        jobLocation: app.jobId?.location,
        jobType: app.jobId?.type,
        jobSalary: app.jobId?.salary,
        applicant: {
          name: app.resumeData?.personalInfo?.name || app.applicantName || 'Unknown Applicant',
          email: app.resumeData?.personalInfo?.email || app.applicantEmail || '',
          phone: app.resumeData?.personalInfo?.phone || app.applicantPhone || '',
          address: app.resumeData?.personalInfo?.address || app.applicantAddress || ''
        },
        resumeData: app.resumeData,
        status: app.status,
        appliedDate: app.appliedDate,
        coverLetter: app.coverLetter || '',
        notes: app.notes || ''
      };
    });

    res.json({
      success: true,
      data: formattedApplications
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Employer)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const { uid } = req.user;

    const application = await Application.findOne({
      _id: id,
      employerUid: uid
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    application.status = status;
    if (notes) application.notes = notes;
    application.updatedAt = new Date();

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated',
      data: {
        applicationId: application._id,
        status: application.status,
        updatedAt: application.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application status'
    });
  }
});

// @route   GET /api/applications/jobseeker
// @desc    Get job seeker's applications
// @access  Private (Job Seeker)
router.get('/jobseeker', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    const applications = await Application.find({ jobSeekerUid: uid })
      .populate('jobId', 'title companyName location type salary')
      .sort({ appliedDate: -1 });

    const formattedApplications = applications.map(app => ({
      id: app._id,
      jobId: app.jobId._id,
      jobTitle: app.jobId.title,
      company: app.jobId.companyName,
      location: app.jobId.location,
      type: app.jobId.type,
      salary: app.jobId.salary,
      status: app.status,
      appliedDate: app.appliedDate,
      updatedAt: app.updatedAt
    }));

    res.json({
      success: true,
      data: formattedApplications
    });

  } catch (error) {
    console.error('Error fetching job seeker applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
});

module.exports = router;
