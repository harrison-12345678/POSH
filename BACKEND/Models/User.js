// models/User.js
const mongoose = require('mongoose');
const connectDB = require('../Config/db');

// Get Atlas connection only
const { atlasConnection } = connectDB();

// Define schema
const userSchema = new mongoose.Schema({
  role: { type: String, required: true, enum: ['student', 'admin'] },

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  registrationNumber: {
    type: String,
    required: function () { return this.role === 'student'; },
  },

  hostelName: { type: String },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: function () { return this.role === 'admin'; },
  },

  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  password: { type: String, required: true },

  profilePicture: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Automatically update `updatedAt` on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create model for Atlas connection only
const User = atlasConnection.model('User', userSchema);

module.exports = User;