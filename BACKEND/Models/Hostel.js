// models/Hostel.js
const mongoose = require('mongoose');
const connectDB = require('../Config/db'); // Import the function

// Get connections by calling the function
const { localConnection, atlasConnection } = connectDB();

// Define schema once
const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String },
  capacity: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

// Create models for both connections
const LocalHostel = localConnection.model('Hostel', hostelSchema);
const AtlasHostel = atlasConnection.model('Hostel', hostelSchema);

// Optional helper to save to both databases at once
async function saveHostelToBoth(data) {
  try {
    const local = await LocalHostel.create(data);
    const atlas = await AtlasHostel.create(data);
    return { local, atlas };
  } catch (error) {
    console.error('Error saving hostel to both DBs:', error);
    throw error;
  }
}

module.exports = { LocalHostel, AtlasHostel, saveHostelToBoth };
