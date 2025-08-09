const mongoose = require('mongoose');

/**
 * User Schema
 * Common base for all roles: job_seeker, employer, and admin
 */
const userSchema = new mongoose.Schema({
  // User's full name
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  
  // User's email address (unique identifier)
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  
  // User's password (not used with Firebase Authentication)
  password: {
    type: String,
    select: false
  },
  
  // User's role in the system
  role: {
    type: String,
    enum: ['job_seeker', 'employer', 'admin'],
    required: true
  },
  
  // Firebase UID for authentication
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  }
}, {
  // Add timestamps (createdAt and updatedAt fields)
  timestamps: true,
  
  // Configure how the document is serialized to JSON
  toJSON: {
    transform: function(doc, ret) {
      // Remove password and __v from JSON output
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});



/**
 * Static method to find user by email
 * @param {string} email - The email to search for
 * @returns {Promise<Object>} - User document if found
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Index for better query performance
userSchema.index({ email: 1 });

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User; 