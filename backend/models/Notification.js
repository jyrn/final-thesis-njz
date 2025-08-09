const mongoose = require('mongoose');

/**
 * Notification Schema
 * For user updates and system notifications
 */
const notificationSchema = new mongoose.Schema({
  // Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notification type
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    trim: true
  },
  
  // Notification message
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false
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
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1 });

// Create and export the Notification model
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 