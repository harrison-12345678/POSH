const Booking = require("../Models/Booking");
const Room = require("../Models/Room");
const User = require("../Models/User");

exports.getAdminDashboardData = async (req, res) => {
  try {
    const hostelId = req.user.hostelId;

    if (!hostelId) {
      return res.status(400).json({ message: "Hostel ID missing from admin account" });
    }

    // Query only data from this admin’s hostel
    const totalRooms = await Room.countDocuments({ hostelId });
    const occupiedRooms = await Room.countDocuments({ hostelId, isAvailable: false });
    const pendingBookings = await Booking.countDocuments({ hostelId, status: "pending" });
    const approvedBookings = await Booking.countDocuments({ hostelId, status: "approved" });
    const rejectedBookings = await Booking.countDocuments({ hostelId, status: "rejected" });

    // Get total unique students who booked this hostel
    const studentCount = await Booking.distinct("studentId", { hostelId });
    const totalStudents = studentCount.length;

    // Get 5 latest bookings for preview
    const recentBookings = await Booking.find({ hostelId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalRooms,
      occupiedRooms,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      totalStudents,
      recentBookings,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error fetching dashboard data" });
  }
};
