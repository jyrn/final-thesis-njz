const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  jobSeekerUid: {
    type: String,
    required: true,
    index: true
  },
  jobSeekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true
  },
  
  // File Information
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  
  // Processing Status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Raw extracted text from OCR/AI processing
  extractedText: {
    type: String,
    default: ''
  },
  
  // Processing Metadata
  processingLog: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  }],
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
ResumeSchema.index({ jobSeekerUid: 1, isActive: 1 });
ResumeSchema.index({ processingStatus: 1 });

// Update timestamp on save
ResumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add processing log entry
ResumeSchema.methods.addProcessingLog = function(status, message, details = null) {
  this.processingLog.push({
    status,
    message,
    details
  });
};

// Method to mark as processed
ResumeSchema.methods.markAsProcessed = function(extractedText) {
  this.processingStatus = 'completed';
  this.extractedText = extractedText;
  this.processedAt = new Date();
};

// Method to mark as failed
ResumeSchema.methods.markAsFailed = function(errorMessage) {
  this.processingStatus = 'failed';
  this.addProcessingLog('failed', errorMessage);
};

// Static method to get active resume for job seeker
ResumeSchema.statics.getActiveResumeForJobSeeker = function(jobSeekerUid) {
  return this.findOne({ 
    jobSeekerUid, 
    isActive: true 
  }).sort({ uploadedAt: -1 });
};

module.exports = mongoose.model('Resume', ResumeSchema);
