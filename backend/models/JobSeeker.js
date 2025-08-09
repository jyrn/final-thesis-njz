const mongoose = require('mongoose');

/**
 * JobSeeker Profile Schema
 * Linked to a User with job seeker specific data
 */
const jobSeekerSchema = new mongoose.Schema({
  // Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Reference to parsed resume
  parsedResumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParsedResume'
  },
  
  // Array of saved job listings
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobListing'
  }],
  
  // Array of job applications
  appliedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }]
}, {
  timestamps: true,
  
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Create and export the JobSeeker model
const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);

module.exports = JobSeeker; 