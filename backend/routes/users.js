const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/counselors', auth, async (req, res) => {
  try {
    const counselors = await User.find({ role: 'counselor' }).select('-password');
    res.json({ success: true, data: counselors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/counselors/:id', auth, async (req, res) => {
  try {
    const counselor = await User.findOne({ _id: req.params.id, role: 'counselor' }).select('-password');
    if (!counselor) return res.status(404).json({ success: false, message: 'Counselor not found' });
    res.json({ success: true, data: counselor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
