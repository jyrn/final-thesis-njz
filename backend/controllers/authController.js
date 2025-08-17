const admin = require("firebase-admin")
const User = require("../models/User")
const path = require("path")
const fs = require("fs")

// Registration
exports.register = async (req, res) => {
  try {
    const { token, firstName, middleName, lastName, role } = req.body
    const resumeFile = req.file

    if (!token) return res.status(400).json({ error: "Firebase token required" })

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token)
    const firebaseId = decodedToken.uid
    const email = decodedToken.email

    // Check if user exists
    let user = await User.findOne({ firebaseId })
    if (user) return res.status(400).json({ error: "User already exists" })

    // Save resume path
    let resumePath = resumeFile ? resumeFile.path : null

    // Create user
    user = new User({
      firebaseId,
      firstName,
      middleName,
      lastName,
      email,
      role,
      resume: resumePath,
    })
    await user.save()

    res.status(201).json({ message: "User registered successfully", user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
}
