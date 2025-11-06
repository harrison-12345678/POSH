const jwt = require('jsonwebtoken');
const Booking = require('../Models/Booking'); // ADD THIS LINE
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// Basic authentication - checks if user is logged in
const auth = (req, res, next) => {
  console.log('Auth middleware triggered');
  console.log('Headers:', req.headers)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied, token missing' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('Decoded JWT payload:', req.user);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Admin authorization - checks if user is an admin
const adminAuth = (req, res, next) => {
  // Check if auth middleware ran first
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// ADD THIS NEW MIDDLEWARE - Check if user has no active booking
const checkNoActiveBooking = async (req, res, next) => {
  try {
    // Check if auth middleware ran first
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const activeBooking = await Booking.findActiveBooking(req.user.id);
    
    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${activeBooking.status} booking for room ${activeBooking.roomId?.roomNumber || 'N/A'}. Please cancel it before creating a new booking.`,
        existingBooking: {
          id: activeBooking._id,
          roomNumber: activeBooking.roomId?.roomNumber,
          hostel: activeBooking.hostelId?.name,
          status: activeBooking.status
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Error in checkNoActiveBooking:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error checking booking status' 
    });
  }
};

// ADD THIS NEW MIDDLEWARE - Get booking status (for frontend)
const getBookingStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const activeBooking = await Booking.findActiveBooking(req.user.id);
    
    req.bookingStatus = {
      hasActiveBooking: !!activeBooking,
      activeBooking: activeBooking
    };
    
    next();
  } catch (error) {
    console.error('Error in getBookingStatus:', error);
    req.bookingStatus = {
      hasActiveBooking: false,
      activeBooking: null
    };
    next();
  }
};

// Export all middlewares
module.exports = { 
  auth, 
  adminAuth, 
  checkNoActiveBooking, // ADD THIS
  getBookingStatus // ADD THIS
};