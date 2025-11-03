const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String },
  capacity: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hostel', hostelSchema);
