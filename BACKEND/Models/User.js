// models/User.js
const mongoose = require('mongoose');
const connectDB = require('../Config/db'); // Import the function

// Get connections by calling the function
const { localConnection, atlasConnection } = connectDB();

// Define schema once
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

// Create models for both connections
const LocalUser = localConnection.model('User', userSchema);
const AtlasUser = atlasConnection.model('User', userSchema);

// Optional helper to save to both databases at once
async function saveUserToBoth(data) {
  try {
    const local = await LocalUser.create(data);
    const atlas = await AtlasUser.create(data);
    return { local, atlas };
  } catch (error) {
    console.error('Error saving user to both DBs:', error);
    throw error;
  }
}

module.exports = { LocalUser, AtlasUser, saveUserToBoth };
