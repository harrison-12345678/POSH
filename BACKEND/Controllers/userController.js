// controllers/userController.js

// ✅ Correct imports for dual DB setup
const { LocalUser, AtlasUser, saveUserToBoth } = require('../models/User');
const User = LocalUser; // Use LocalUser for existing queries; AtlasUser could also be used
const bcrypt = require('bcryptjs');

// ============================
// Admin-only controllers
// ============================

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // hide passwords
    res.status(200).json(users);
  } catch (err) {
    console.error('Get Users Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    console.error('Get User Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user (admin can update any user)
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, phoneNumber },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Update User Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================
// Authenticated student/profile controllers
// ============================

// GET: Student profile (authenticated user)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // req.user from auth middleware
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT: Update profile (authenticated user)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { firstName, lastName, phoneNumber, password } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Update profile picture if file uploaded
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// ============================
// Signup / Registration Example
// ============================

exports.signupUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user exists in Local DB
    const existingUser = await LocalUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to both databases
    const { local, atlas } = await saveUserToBoth({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({ message: 'User created successfully', local, atlas });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};
