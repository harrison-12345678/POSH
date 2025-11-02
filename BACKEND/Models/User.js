const mongoose = require('mongoose');

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

  // 👇 New optional fields for profile updates
  profilePicture: {
    type: String,
    default: '', // URL or path to uploaded image
  },

  // For profile edits, timestamps are useful
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Automatically update `updatedAt` on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
