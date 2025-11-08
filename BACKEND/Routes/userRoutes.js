const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile
} = require('../Controllers/userController');

const { auth, adminAuth } = require('../Middleware/authMiddleware.js');

// ==========================
// File upload setup for profile picture
// ==========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==========================
// Authenticated user routes
// ==========================
router.get('/profile/me', auth, getProfile);
router.put('/profile/me', auth, upload.single('profilePicture'), updateProfile);

// ==========================
// Admin-only routes (prefixed with /admin to avoid conflicts)
// ==========================
router.get('/admin', auth, adminAuth, getAllUsers);
router.get('/admin/:id', auth, adminAuth, getUserById);
router.put('/admin/:id', auth, adminAuth, updateUser);
router.delete('/admin/:id', auth, adminAuth, deleteUser);

module.exports = router;
