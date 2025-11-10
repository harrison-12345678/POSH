const { AtlasBooking } = require("../Models/Booking");
const { AtlasRoom } = require("../Models/Room");
const { AtlasUser } = require("../models/User");

// Admin dashboard data
exports.getAdminDashboardData = async (req, res) => {
  try {
    const hostelId = req.user.hostelId;

    if (!hostelId) {
      return res.status(400).json({ message: "Hostel ID missing from admin account" });
    }

    // Use Atlas DB for all data
    const totalRooms = await AtlasRoom.countDocuments({ hostelId });
    const occupiedRooms = await AtlasRoom.countDocuments({ hostelId, isAvailable: false });
    const pendingBookings = await AtlasBooking.countDocuments({ hostelId, status: "pending" });
    const approvedBookings = await AtlasBooking.countDocuments({ hostelId, status: "approved" });
    const rejectedBookings = await AtlasBooking.countDocuments({ hostelId, status: "rejected" });

    const studentCount = await AtlasBooking.distinct("studentId", { hostelId });
    const totalStudents = studentCount.length;

    const recentBookings = await AtlasBooking.find({ hostelId })
      .populate("studentId", "firstName lastName email")
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