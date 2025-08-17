const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true }, // links to Firebase
  name: { type: String, required: true }, // Changed from fullname to name for consistency
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["job_seeker", "employer", "admin"], default: "job_seeker" }, // Updated enum values
  emailVerified: { type: Boolean, default: false },
  photoURL: { type: String, default: null },
  lastLoginAt: { type: Date, default: null },
  lastLogoutAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

// Index for better query performance
userSchema.index({ firebaseUid: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);
