const express = require('express');
const router = express.Router();
const {
  createRoom,
  getHostelRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
   getAllRooms,     // <-- add this
  getRoomDetails 
} = require('../Controllers/roomController');
const { auth, adminAuth } = require('../Middleware/authMiddleware');

// ==================== STUDENT ROUTES ==================
// Fetch all rooms (with hostel name populated)
router.get('/all', auth, getAllRooms);

// Fetch single room details (optional)
router.get('/details/:id', auth, getRoomDetails);

// All routes protected - require admin authentication
router.post('/', auth, adminAuth, createRoom);
router.get('/', auth, adminAuth, getHostelRooms);
router.get('/:id', auth, adminAuth, getRoomById);
router.put('/:id', auth, adminAuth, updateRoom);
router.delete('/:id', auth, adminAuth, deleteRoom);
