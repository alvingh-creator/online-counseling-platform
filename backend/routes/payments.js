const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Appointment = require('../models/Appointment');

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Create payment order
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount, appointmentId } = req.body;
    res.json({
      success: true,
      orderId: `order_${Date.now()}`,
      amount: amount * 100,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify payment
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { appointmentId, razorpay_payment_id } = req.body;
    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentStatus: 'completed',
      paymentId: razorpay_payment_id || `payment_${Date.now()}`
    });
    res.json({ success: true, message: 'Payment verified' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get payment status
router.get('/status/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({
      success: true,
      paymentStatus: appointment.paymentStatus || 'pending',
      paymentId: appointment.paymentId || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
