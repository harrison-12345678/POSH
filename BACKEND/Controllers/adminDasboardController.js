const { LocalBooking, AtlasBooking } = require("../Models/Booking");
const { LocalRoom, AtlasRoom } = require("../Models/Room");
const { LocalUser, AtlasUser } = require("../models/User");

// Admin dashboard data
exports.getAdminDashboardData = async (req, res) => {
  try {
    const hostelId = req.user.hostelId;

    if (!hostelId) {
      return res.status(400).json({ message: "Hostel ID missing from admin account" });
    }

    // --- Use Local DB for counting, you could also aggregate from Atlas if needed ---
    const totalRooms = await LocalRoom.countDocuments({ hostelId });
    const occupiedRooms = await LocalRoom.countDocuments({ hostelId, isAvailable: false });
    const pendingBookings = await LocalBooking.countDocuments({ hostelId, status: "pending" });
    const approvedBookings = await LocalBooking.countDocuments({ hostelId, status: "approved" });
    const rejectedBookings = await LocalBooking.countDocuments({ hostelId, status: "rejected" });

    const studentCount = await LocalBooking.distinct("studentId", { hostelId });
    const totalStudents = studentCount.length;

    const recentBookings = await LocalBooking.find({ hostelId })
      .populate("studentId", "firstName lastName email") // changed from 'name' to firstName + lastName
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
