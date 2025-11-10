const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Simple inline auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token provided' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid authentication token' 
    });
  }
};

// Get all counselors
router.get('/counselors', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching counselors...');
    
    const counselors = await User.find({ 
      role: 'counselor' 
    }).select('-password');
    
    console.log(`Found ${counselors.length} counselors`);
    
    res.json({ 
      success: true, 
      data: counselors 
    });
  } catch (error) {
    console.error('Error fetching counselors:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch counselors',
      error: error.message 
    });
  }
});

// Get single counselor by ID
router.get('/counselors/:id', authMiddleware, async (req, res) => {
  try {
    const counselor = await User.findOne({ 
      _id: req.params.id, 
      role: 'counselor' 
    }).select('-password');
    
    if (!counselor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Counselor not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: counselor 
    });
  } catch (error) {
    console.error('Error fetching counselor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch counselor',
      error: error.message 
    });
  }
});

module.exports = router;
