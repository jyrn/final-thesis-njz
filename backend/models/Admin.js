const mongoose = require('mongoose');

/**
 * Admin Schema
 * Linked to User with admin specific data
 */
const adminSchema = new mongoose.Schema({
  // Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Admin position/title
  position: {
    type: String,
    required: [true, 'Admin position is required'],
    trim: true,
    maxlength: [50, 'Position cannot be more than 50 characters']
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
adminSchema.index({ userId: 1 });

// Create and export the Admin model
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin; 