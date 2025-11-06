const express = require('express');
const router = express.Router();
const path = require('path');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const User = require('../models/User');
const { sendBookingConfirmation, sendAppointmentConfirmed, sendAppointmentRejected, sendAppointmentReminder } = require('../services/emailService');

// Get all counselors (for clients to browse)
router.get('/counselors', protect, async (req, res) => {
  try {
    const counselors = await User.find({ role: 'counselor' }).select('-password');
    res.status(200).json({ success: true, data: counselors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single counselor details
router.get('/counselors/:id', protect, async (req, res) => {
  try {
    const counselor = await User.findById(req.params.id).select('-password');
    if (!counselor || counselor.role !== 'counselor') {
      return res.status(404).json({ message: 'Counselor not found' });
    }
    res.status(200).json({ success: true, data: counselor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get counselor availability
router.get('/availability/:counselorId', protect, async (req, res) => {
  try {
    const availability = await Availability.findOne({ counselor: req.params.counselorId });
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    res.status(200).json({ success: true, data: availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update counselor availability (counselor only)
router.put('/availability/update', protect, restrictTo('counselor'), async (req, res) => {
  try {
    const { schedule, exceptions } = req.body;

    let availability = await Availability.findOne({ counselor: req.user.id });

    if (!availability) {
      availability = await Availability.create({
        counselor: req.user.id,
        schedule,
        exceptions
      });
    } else {
      availability.schedule = schedule;
      availability.exceptions = exceptions;
      await availability.save();
    }

    res.status(200).json({ success: true, message: 'Availability updated', data: availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create appointment with availability check
router.post('/create', protect, restrictTo('client'), async (req, res) => {
  try {
    const { counselorId, serviceType, appointmentDate, appointmentTime, sessionType, notes } = req.body;

    if (!counselorId || !serviceType || !appointmentDate || !appointmentTime || !sessionType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const counselor = await User.findById(counselorId);
    if (!counselor || counselor.role !== 'counselor') {
      return res.status(404).json({ message: 'Counselor not found' });
    }

    // Check availability
    const availability = await Availability.findOne({ counselor: counselorId });
    if (availability) {
      const appointmentDateObj = new Date(appointmentDate);
      const dayOfWeek = appointmentDateObj.getDay();
      const [hours, minutes] = appointmentTime.split(':');

      const schedule = availability.schedule.find(s => s.dayOfWeek === dayOfWeek && s.isWorking);
      if (!schedule) {
        return res.status(400).json({ message: 'Counselor is not available on this day' });
      }

      const [startHours, startMinutes] = schedule.startTime.split(':');
      const [endHours, endMinutes] = schedule.endTime.split(':');

      const appointmentTimeMinutes = parseInt(hours) * 60 + parseInt(minutes);
      const startTimeMinutes = parseInt(startHours) * 60 + parseInt(startMinutes);
      const endTimeMinutes = parseInt(endHours) * 60 + parseInt(endMinutes);

      if (appointmentTimeMinutes < startTimeMinutes || appointmentTimeMinutes >= endTimeMinutes) {
        return res.status(400).json({ message: 'Selected time is outside counselor working hours' });
      }
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      counselor: counselorId,
      appointmentDate,
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });
    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      client: req.user.id,
      counselor: counselorId,
      serviceType,
      appointmentDate,
      appointmentTime,
      sessionType,
      notes,
      amount: counselor.hourlyRate
    });

    // Send email to counselor
    const client = await User.findById(req.user.id);
    await sendBookingConfirmation(
      counselor.email,
      counselor.name,
      client.name,
      appointmentDate,
      appointmentTime
    );

    appointment.emailSent.bookingNotification = true;
    await appointment.save();

    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get client's appointments
router.get('/my-appointments', protect, restrictTo('client'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ client: req.user.id })
      .populate('counselor', 'name specialization hourlyRate')
      .sort({ appointmentDate: -1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get counselor's appointments
router.get('/counselor-appointments', protect, restrictTo('counselor'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ counselor: req.user.id })
      .populate('client', 'name email phone')
      .sort({ appointmentDate: -1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get client records for counselor
router.get('/client-records/:clientId', protect, restrictTo('counselor'), async (req, res) => {
  try {
    const appointments = await Appointment.find({
      client: req.params.clientId,
      counselor: req.user.id,
      status: { $in: ['completed', 'confirmed'] }
    })
      .populate('client', 'name email')
      .sort({ appointmentDate: -1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel appointment
router.put('/cancel/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.client.toString() !== req.user.id && appointment.counselor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    res.status(200).json({ success: true, message: 'Appointment cancelled successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm/Accept appointment (counselor)
router.put('/confirm/:id', protect, restrictTo('counselor'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'email name')
      .populate('counselor', 'name');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.counselor._id.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    appointment.status = 'confirmed';
    await appointment.save();

    // Send confirmation email to client
    await sendAppointmentConfirmed(
      appointment.client.email,
      appointment.client.name,
      appointment.counselor.name,
      appointment.appointmentDate,
      appointment.appointmentTime
    );

    appointment.emailSent.confirmationNotification = true;
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment confirmed', data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject appointment (counselor)
router.put('/reject/:id', protect, restrictTo('counselor'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'email name')
      .populate('counselor', 'name');

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.counselor._id.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    appointment.status = 'rejected';
    await appointment.save();

    // Send rejection email to client
    await sendAppointmentRejected(
      appointment.client.email,
      appointment.client.name,
      appointment.counselor.name
    );

    appointment.emailSent.rejectionNotification = true;
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment rejected', data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete appointment with notes
router.put('/complete/:id', protect, restrictTo('counselor'), async (req, res) => {
  try {
    const { notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.counselor.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    appointment.status = 'completed';
    if (notes) appointment.counselorNotes = notes;
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment marked as completed', data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add/update counselor notes
router.put('/notes/:id', protect, restrictTo('counselor'), async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes) return res.status(400).json({ message: 'Notes are required' });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.counselor.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    appointment.counselorNotes = notes;
    await appointment.save();

    res.status(200).json({ success: true, message: 'Notes added successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload file attachment to session notes
router.post('/upload-attachment/:appointmentId', protect, restrictTo('counselor'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.counselor.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const fileUrl = `/uploads/${req.file.filename}`;

    appointment.attachments.push({
      fileName: req.file.originalname,
      fileUrl: fileUrl
    });

    await appointment.save();

    res.status(200).json({ success: true, message: 'File uploaded successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Authorize video call access
router.get('/authorize-video/:appointmentId', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const isAuthorized = 
      appointment.client.toString() === req.user.id || 
      appointment.counselor.toString() === req.user.id;

    if (!isAuthorized) return res.status(403).json({ message: 'Not authorized for this call' });

    res.status(200).json({ success: true, message: 'Authorized', data: { appointmentId: req.params.appointmentId } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
