// models/Booking.js
const mongoose = require('mongoose');
const connectDB = require('../Config/db');

// Get Atlas connection only
const  atlasConnection  = connectDB();

// Define schema once
const bookingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

// Unique index to prevent multiple active bookings
bookingSchema.index(
  { studentId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["pending", "approved"] } } }
);

// Helper to find active booking
bookingSchema.statics.findActiveBooking = function(studentId) {
  return this.findOne({
    studentId,
    status: { $in: ["pending", "approved"] }
  }).populate('hostelId').populate('roomId');
};

// Helper to check if user can book
bookingSchema.statics.canUserBook = function(studentId) {
  return this.findOne({
    studentId,
    status: { $in: ["pending", "approved"] }
  }).then(existingBooking => ({
    canBook: !existingBooking,
    existingBooking
  }));
};

// Create model for Atlas connection only
const Booking = atlasConnection.model("Booking", bookingSchema);

module.exports = Booking;