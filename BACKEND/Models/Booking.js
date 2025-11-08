// models/Booking.js
const mongoose = require('mongoose');
const connectDB = require('../Config/db'); // Import the function

// Get connections by calling the function
const { localConnection, atlasConnection } = connectDB();

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

// Create models for both connections
const LocalBooking = localConnection.model("Booking", bookingSchema);
const AtlasBooking = atlasConnection.model("Booking", bookingSchema);

// Optional helper to save to both databases at once
async function saveBookingToBoth(data) {
  try {
    const local = await LocalBooking.create(data);
    const atlas = await AtlasBooking.create(data);
    return { local, atlas };
  } catch (error) {
    console.error('Error saving booking to both DBs:', error);
    throw error;
  }
}

module.exports = { LocalBooking, AtlasBooking, saveBookingToBoth };
