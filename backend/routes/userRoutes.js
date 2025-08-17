const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { getProfile, saveProfile } = require('../controllers/userController');

router.get('/profile', verifyToken, getProfile);
router.post('/profile', verifyToken, saveProfile);

module.exports = router;
