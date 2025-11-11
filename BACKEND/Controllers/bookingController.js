// controllers/bookingController.js

const Booking = require("../Models/Booking");
const Room = require("../Models/Room");

// Student creates booking
exports.createBooking = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.isOccupied) {
      return res.status(400).json({ message: "Room is already occupied" });
    }

    // Check if student has ANY active booking
    const existingStudentBooking = await Booking.findOne({
      studentId: req.user.id,
      status: { $in: ["pending", "approved"] },
    });

    if (existingStudentBooking) {
      return res.status(400).json({
        message: `You already have a ${existingStudentBooking.status} booking. Cancel it before booking a new room.`,
      });
    }

    // Check if ANY student has already booked this room
    const existingRoomBooking = await Booking.findOne({
      roomId: room._id,
      status: { $in: ["pending", "approved"] },
    });

    if (existingRoomBooking) {
      return res.status(400).json({
        message: "Room is already booked by another student. Please try another room.",
      });
    }

    // Save to Atlas DB
    const booking = await Booking.create({
      studentId: req.user.id,
      roomId: room._id,
      hostelId: room.hostelId,
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "You already have an active booking. Please cancel it first.",
      });
    }
    res.status(500).json({ message: err.message });
  }
};

// Check booking status for frontend
exports.getBookingStatus = async (req, res) => {
  try {
    const activeBooking = await Booking.findOne({
      studentId: req.user.id,
      status: { $in: ["pending", "approved"] },
    })
      .populate("roomId")
      .populate("hostelId");

    res.json({
      hasActiveBooking: !!activeBooking,
      activeBooking,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (booking.status === "approved") {
      const room = await Room.findById(booking.roomId);
      if (room) {
        room.isOccupied = false;
        await room.save();
      }
    }

    await Booking.findByIdAndDelete(req.params.bookingId);

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student booking history
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id })
      .populate("roomId")
      .populate("hostelId", "name");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin view all pending bookings
exports.getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: "pending",
      hostelId: req.user.hostelId,
    })
      .populate("studentId", "firstName lastName email")
      .populate("roomId")
      .populate("hostelId", "name");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin approves/rejects booking
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, action } = req.params;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Action must be 'approve' or 'reject'" });
    }

    const booking = await Booking.findById(bookingId).populate("roomId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.hostelId.toString() !== req.user.hostelId) {
      return res.status(403).json({ message: "Access denied - Not your hostel" });
    }

    if (action === "approve") {
      booking.status = "approved";
      booking.roomId.isOccupied = true;
      await booking.roomId.save();
    } else {
      booking.status = "rejected";
      booking.roomId.isOccupied = false;
      await booking.roomId.save();
    }

    await booking.save();

    const updatedBooking = await Booking.findById(bookingId)
      .populate("studentId", "firstName lastName email")
      .populate("roomId")
      .populate("hostelId", "name");

    res.json({
      message: `Booking ${action}d successfully`,
      booking: updatedBooking,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin dashboard - all bookings
exports.getAllBookingsForAdmin = async (req, res) => {
  try {
    const bookings = await Booking.find({ hostelId: req.user.hostelId })
      .populate("studentId", "firstName lastName email")
      .populate("roomId")
      .populate("hostelId", "name")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
