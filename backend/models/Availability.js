const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  schedule: [
    {
      dayOfWeek: {
        type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        required: true,
        min: 0,
        max: 6
      },
      startTime: {
        type: String, // Format: "09:00"
        required: true
      },
      endTime: {
        type: String, // Format: "17:00"
        required: true
      },
      isWorking: {
        type: Boolean,
        default: true
      }
    }
  ],
  exceptions: [
    {
      date: Date,
      startTime: String,
      endTime: String,
      isAvailable: {
        type: Boolean,
        default: false
      },
      reason: String // e.g., "Holiday", "Personal"
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);
