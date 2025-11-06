const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { protect, restrictTo } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment order (client initiates payment)
router.post('/create-order', protect, restrictTo('client'), async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // Get appointment details
    const appointment = await Appointment.findById(appointmentId)
      .populate('counselor', 'name hourlyRate');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Amount in paise (1 INR = 100 paise)
    const amount = Math.round(appointment.amount * 100);

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${appointmentId}_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        appointmentId: appointmentId,
        clientId: req.user.id,
        counselorId: appointment.counselor._id.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    // Save payment record in database
    const payment = await Payment.create({
      appointment: appointmentId,
      client: req.user.id,
      counselor: appointment.counselor._id,
      amount: appointment.amount,
      razorpayOrderId: order.id,
      status: 'pending',
      metadata: {
        appointmentId: appointmentId,
        clientId: req.user.id,
        counselorId: appointment.counselor._id.toString()
      }
    });

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID
      },
      paymentId: payment._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Verify payment (after Razorpay processes it)
router.post('/verify-payment', protect, restrictTo('client'), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed'
      });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'succeeded',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      },
      { new: true }
    );

    // Update appointment status
    await Appointment.findByIdAndUpdate(
      payment.appointment,
      { paymentStatus: 'completed', status: 'confirmed' }
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get payment history
router.get('/history', protect, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'client') {
      query = { client: req.user.id };
    } else if (req.user.role === 'counselor') {
      query = { counselor: req.user.id };
    }

    const payments = await Payment.find(query)
      .populate('appointment')
      .populate('client', 'name email')
      .populate('counselor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment details
router.get('/:paymentId', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('appointment')
      .populate('client', 'name email')
      .populate('counselor', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
