const mongoose = require('mongoose');

/**
 * ParsedResume Schema
 * Belongs to JobSeeker with parsed resume data
 */
const parsedResumeSchema = new mongoose.Schema({
  // Reference to JobSeeker
  jobSeekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true
  },
  
  // Resume file URL
  resumeUrl: {
    type: String,
    required: [true, 'Resume URL is required']
  },
  
  // Parsed skills from resume
  skills: [{
    type: String,
    trim: true
  }],
  
  // Education information
  education: [{
    degree: {
      type: String,
      trim: true
    },
    institution: {
      type: String,
      trim: true
    },
    graduationYear: {
      type: Number
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4
    }
  }],
  
  // Work experience
  experience: [{
    title: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    current: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      trim: true
    }
  }],
  
  // Certifications
  certifications: [{
    name: {
      type: String,
      trim: true
    },
    issuer: {
      type: String,
      trim: true
    },
    issueDate: {
      type: Date
    },
    expiryDate: {
      type: Date
    },
    credentialId: {
      type: String,
      trim: true
    }
  }],
  
  // Raw text extracted from resume
  rawText: {
    type: String,
    required: [true, 'Raw text is required']
  }
}, {
  timestamps: true,
  
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Index for better query performance
parsedResumeSchema.index({ jobSeekerId: 1 });

// Create and export the ParsedResume model
const ParsedResume = mongoose.model('ParsedResume', parsedResumeSchema);

module.exports = ParsedResume; 