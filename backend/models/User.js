const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true }, // links to Firebase
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ["jobseeker", "employer", "admin"], default: "jobseeker" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
