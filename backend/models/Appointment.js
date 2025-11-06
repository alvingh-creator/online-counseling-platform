const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['mental-health', 'relationship', 'career'],
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  sessionType: {
    type: String,
    enum: ['video', 'chat', 'email'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  notes: String,            // client-provided notes at booking
  counselorNotes: String,   // counselor session notes
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  emailSent: {
    bookingNotification: {
      type: Boolean,
      default: false
    },
    confirmationNotification: {
      type: Boolean,
      default: false
    },
    rejectionNotification: {
      type: Boolean,
      default: false
    },
    reminderNotification: {
      type: Boolean,
      default: false
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
