const mongoose = require('mongoose');

/**
 * Employer Schema
 * Linked to a User with employer specific data
 */
const employerSchema = new mongoose.Schema({
  // Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Company information
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  
  // Business permit document URL
  businessPermitUrl: {
    type: String,
    required: [true, 'Business permit is required']
  },
  
  // Verification status
  verified: {
    type: Boolean,
    default: false
  },
  
  // Admin who approved the employer
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
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

// Create and export the Employer model
const Employer = mongoose.model('Employer', employerSchema);

module.exports = Employer; 