const User = require('../models/User');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    res.json(user || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save or update profile
const saveProfile = async (req, res) => {
  try {
    const userData = { ...req.body, uid: req.user.uid };
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      userData,
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getProfile, saveProfile };
