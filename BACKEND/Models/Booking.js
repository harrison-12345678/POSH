const mongoose = require("mongoose");

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

// ADD THESE LINES - Database constraint to prevent multiple active bookings
bookingSchema.index(
  { 
    studentId: 1, 
    status: 1 
  }, 
  { 
    unique: true, 
    partialFilterExpression: { 
      status: { $in: ["pending", "approved"] } 
    } 
  }
);

// ADD THIS METHOD - Helper to find active booking
bookingSchema.statics.findActiveBooking = function(studentId) {
  return this.findOne({
    studentId: studentId,
    status: { $in: ["pending", "approved"] }
  }).populate('hostelId').populate('roomId');
};

// ADD THIS METHOD - Check if user can book (optional helper)
bookingSchema.statics.canUserBook = function(studentId) {
  return this.findOne({
    studentId: studentId,
    status: { $in: ["pending", "approved"] }
  }).then(existingBooking => {
    return {
      canBook: !existingBooking,
      existingBooking: existingBooking
    };
  });
};

module.exports = mongoose.model("Booking", bookingSchema);