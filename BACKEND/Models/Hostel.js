// models/Hostel.js
const mongoose = require('mongoose');
const connectDB = require('../Config/db');

// Get Atlas connection only
const { atlasConnection } = connectDB();

// Define schema
const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String },
  capacity: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

// Create model for Atlas connection only
const Hostel = atlasConnection.model('Hostel', hostelSchema);

module.exports = Hostel;