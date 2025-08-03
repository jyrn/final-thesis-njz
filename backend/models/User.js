const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Defines the structure and validation rules for user documents in MongoDB
 */
const userSchema = new mongoose.Schema({
  // User's full name
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true, // Remove whitespace from beginning and end
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  
  // User's email address (unique identifier)
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Ensure email is unique across all users
    lowercase: true, // Convert to lowercase for consistency
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  
  // User's password (will be hashed)
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // User's role in the system
  role: {
    type: String,
    enum: ['admin', 'hr_manager', 'recruiter', 'applicant'],
    default: 'applicant',
    required: true
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Profile completion status
  profileCompleted: {
    type: Boolean,
    default: false
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
 * Pre-save middleware to hash password before saving
 * This runs before the document is saved to the database
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare password with hashed password
 * @param {string} candidatePassword - The password to check
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Static method to find user by email
 * @param {string} email - The email to search for
 * @returns {Promise<Object>} - User document if found
 */
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User; 