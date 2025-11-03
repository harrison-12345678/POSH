const Booking = require("../Models/Booking");
const Room = require("../Models/Room");

// Student creates booking
exports.createBooking = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Check if room is available/occupied
    if (room.isOccupied) {
      return res.status(400).json({ message: "Room is already occupied" });
    }

    // ✅ ADDED: Check if ANY student has already booked this room (pending or approved)
    const existingRoomBooking = await Booking.findOne({
      roomId: room._id,
      status: { $in: ["pending", "approved"] } // Check for both pending AND approved
    });
    
    if (existingRoomBooking) {
      return res.status(400).json({ 
        message: "Room is already booked by another student. Please try another room." 
      });
    }

    // Check if this specific student has already booked this room
    const existingStudentBooking = await Booking.findOne({
      studentId: req.user.id,
      roomId: room._id,
      status: { $in: ["pending", "approved"] }
    });
    if (existingStudentBooking) return res.status(400).json({ message: "Already booked this room" });

    const booking = await Booking.create({
      studentId: req.user.id,
      roomId: room._id,
      hostelId: room.hostelId // ← ADDED: Store hostelId from the room
    });

    res.status(201).json({ 
      message: "Booking created successfully",
      booking 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student booking history
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id })
      .populate("roomId")
      .populate("hostelId", "name"); // ← ADDED: Populate hostel info
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: view all pending bookings FOR THEIR HOSTEL ONLY
exports.getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      status: "pending",
      hostelId: req.user.hostelId // ← CHANGED: Only show bookings for admin's hostel
    })
      .populate("studentId", "name email")
      .populate("roomId")
      .populate("hostelId", "name"); // ← ADDED: Populate hostel info

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin approves/rejects booking - WITH HOSTEL VERIFICATION
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, action } = req.params;
    
    // Validate action parameter
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Action must be 'approve' or 'reject'" });
    }

    const booking = await Booking.findById(bookingId).populate("roomId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // ✅ SECURITY CHECK: Verify booking belongs to admin's hostel
    if (booking.hostelId.toString() !== req.user.hostelId) {
      return res.status(403).json({ message: "Access denied - Not your hostel" });
    }

    if (action === "approve") {
      booking.status = "approved";
      booking.roomId.isOccupied = true;
      await booking.roomId.save();
    } else if (action === "reject") {
      booking.status = "rejected";
      // ✅ ADDED: When rejected, free up the room for other students
      booking.roomId.isOccupied = false;
      await booking.roomId.save();
    }

    await booking.save();
    
    // Get updated booking with populated data
    const updatedBooking = await Booking.findById(bookingId)
      .populate("studentId", "name email")
      .populate("roomId")
      .populate("hostelId", "name");
      
    res.json({ 
      message: `Booking ${action}d successfully`,
      booking: updatedBooking 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
