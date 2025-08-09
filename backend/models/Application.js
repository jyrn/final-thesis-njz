const mongoose = require('mongoose');

/**
 * Application Schema
 * Represents a job application with status tracking
 */
const applicationSchema = new mongoose.Schema({
  // Reference to JobListing
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobListing',
    required: true
  },
  
  // Reference to JobSeeker
  jobSeekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true
  },
  
  // Reference to ParsedResume used for application (optional)
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParsedResume'
  },
  
  // Application status
  status: {
    type: String,
    enum: ['pending', 'interviewed', 'hired', 'not_hired'],
    default: 'pending'
  },
  
  // Feedback from employer
  feedback: {
    type: String,
    trim: true
  },
  
  // Reason for rejection if not hired
  reasonForRejection: {
    type: String,
    trim: true
  },
  
  // Application timestamp
  appliedAt: {
    type: Date,
    default: Date.now
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

// Indexes for better query performance
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ jobSeekerId: 1 });
applicationSchema.index({ appliedAt: -1 });

// Create and export the Application model
const Application = mongoose.model('Application', applicationSchema);

module.exports = Application; 