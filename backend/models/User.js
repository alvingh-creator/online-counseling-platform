const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define what information a user has
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Don't send password in API responses
  },
  role: {
    type: String,
    enum: ['client', 'counselor'], // User can only be one of these
    required: true
  },
  // Counselor-specific fields
  specialization: {
    type: String,
    required: function() { return this.role === 'counselor'; }
  },
  licenseNumber: {
    type: String,
    required: function() { return this.role === 'counselor'; }
  },
  hourlyRate: {
    type: Number,
    required: function() { return this.role === 'counselor'; }
  },
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  // Common fields
  phone: String,
  profilePicture: String,
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Encrypt password before saving to database
userSchema.pre('save', async function(next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return next();
  
  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
