const mongoose = require('mongoose');

/**
 * JobListing Schema
 * Posted by Employer with job details and requirements
 */
const jobListingSchema = new mongoose.Schema({
  // Reference to Employer who posted the job
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  
  // Job details
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot be more than 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true
  },
  
  // Job requirements
  qualifications: [{
    type: String,
    trim: true
  }],
  
  skillsRequired: [{
    type: String,
    trim: true
  }],
  
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true
  },
  
  salaryRange: {
    min: {
      type: Number,
      required: [true, 'Minimum salary is required']
    },
    max: {
      type: Number,
      required: [true, 'Maximum salary is required']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  workplaceType: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
    required: [true, 'Workplace type is required']
  },
  
  positionLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'executive'],
    required: [true, 'Position level is required']
  },
  
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
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
jobListingSchema.index({ employerId: 1, status: 1 });
jobListingSchema.index({ status: 1, createdAt: -1 });
jobListingSchema.index({ _id: 1 }); // jobId index

// Create and export the JobListing model
const JobListing = mongoose.model('JobListing', jobListingSchema);

module.exports = JobListing; 