const mongoose = require('mongoose');

const ParsedResumeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  personalInfo: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  education: [{
    degree: String,
    field: String,
    institution: String,
    year: String
  }],
  experience: [{
    position: String,
    company: String,
    duration: String,
    description: String
  }],
  skills: [String],
  extractedText: String,
  parsingMetadata: {
    entityCount: Number,
    parsedAt: {
      type: Date,
      default: Date.now
    },
    nerModelVersion: String,
    confidence: Number
  },
  // AI Job Matching fields
  skillsVector: [Number], // For AI similarity matching
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'executive'],
    default: 'entry'
  },
  industryTags: [String], // Extracted industry keywords
  locationPreferences: [String],
  salaryRange: {
    min: Number,
    max: Number
  }
}, {
  timestamps: true
});

// Indexes for AI job matching
ParsedResumeSchema.index({ userId: 1, 'parsingMetadata.parsedAt': -1 });
ParsedResumeSchema.index({ 'experience.skills': 1 });
ParsedResumeSchema.index({ industryTags: 1 });
ParsedResumeSchema.index({ experienceLevel: 1 });

module.exports = mongoose.model('ParsedResume', ParsedResumeSchema);
