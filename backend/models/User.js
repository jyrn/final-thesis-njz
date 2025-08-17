const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  fullName: { type: String, required: true },
  role: { type: String, enum: ['jobseeker', 'employer', 'admin'], default: 'jobseeker' },
  age: Number,
  address: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
