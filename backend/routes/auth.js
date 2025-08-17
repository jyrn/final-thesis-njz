const express = require("express");
const router = express.Router();
const admin = require("../config/firebase");
const User = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullname, role } = req.body;

    // 1. Create user in Firebase
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
    });

    // 2. Save extra info in MongoDB
    const newUser = new User({
      firebaseUid: firebaseUser.uid,
      fullname,
      email,
      role,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
