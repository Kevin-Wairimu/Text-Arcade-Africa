const mongoose = require('mongoose');

// Define the schema for the User model
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['Client', 'Admin', 'Employee'],
    default: 'Client',
  },
  
  // --- THESE ARE THE CRITICAL FIELDS ---
  // Ensure they exist and are spelled correctly, with the correct data types.
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  
}, {
  // Add timestamps for createdAt and updatedAt fields automatically
  timestamps: true,
});

// Create and export the model
module.exports = mongoose.model('User', UserSchema);