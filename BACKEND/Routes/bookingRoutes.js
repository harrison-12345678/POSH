const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../Middleware/authMiddleware");
const {
  createBooking,
  getMyBookings,
  getPendingBookings,
  updateBookingStatus,
  getBookingStatus,
  cancelBooking,
  getAllBookingsForAdmin 
} = require("../Controllers/bookingController");

// Student routes
router.get("/status", auth, getBookingStatus);                    // ✅ NEW
router.post("/book/:roomId", auth, createBooking);               // EXISTING
router.get("/student/me", auth, getMyBookings);                  // EXISTING  
router.delete("/:bookingId/cancel", auth, cancelBooking);        // ✅ NEW

// Admin routes
router.get("/admin/pending", auth, adminAuth, getPendingBookings); 
router.get("/admin/all", auth, adminAuth, getAllBookingsForAdmin);        
router.put("/admin/:bookingId/:action", auth, adminAuth, updateBookingStatus); // EXISTING

module.exports = router;