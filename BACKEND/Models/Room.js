// models/Room.js
const mongoose = require('mongoose');
const connectDB = require('../Config/db');

// Get Atlas connection only
const  atlasConnection  = connectDB();

// Define schema
const roomSchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  roomNumber: { type: String, required: true },
  roomType: { type: String, enum: ['single', 'double', 'shared', 'suite'], required: true },
  capacity: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  images: [{ type: String }],
  amenities: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Prevent duplicate room numbers in the same hostel
roomSchema.index({ hostelId: 1, roomNumber: 1 }, { unique: true });

// Create model for Atlas connection only
const Room = atlasConnection.model('Room', roomSchema);

module.exports = Room;