// models/Room.js
const mongoose = require('mongoose');
const connectDB = require('../Config/db'); // Import the function

// Get connections by calling the function
const { localConnection, atlasConnection } = connectDB();

// Define schema once
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

// Create models for both connections
const LocalRoom = localConnection.model('Room', roomSchema);
const AtlasRoom = atlasConnection.model('Room', roomSchema);

// Optional helper to save to both databases at once
async function saveRoomToBoth(data) {
  try {
    const local = await LocalRoom.create(data);
    const atlas = await AtlasRoom.create(data);
    return { local, atlas };
  } catch (error) {
    console.error('Error saving room to both DBs:', error);
    throw error;
  }
}

module.exports = { LocalRoom, AtlasRoom, saveRoomToBoth };
