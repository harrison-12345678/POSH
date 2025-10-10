const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    const { role, firstName, lastName, registrationNumber, hostelName, hostelId, email, phoneNumber, password } = req.body;

    if (role === 'student' && !registrationNumber) {
      return res.status(400).json({ message: 'Registration number is required for students' });
    }
    if (role === 'admin' && !hostelId) {
      return res.status(400).json({ message: 'Hostel name is required for admins' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      role, firstName, lastName, registrationNumber,
      hostelName, hostelId: role === 'admin' ? hostelId : null,
      email, phoneNumber, password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const payload = { id: user._id, role: user.role, hostelId: user.role === 'admin' ? user.hostelId : null };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, role: user.role, email: user.email, hostelId: user.hostelId || null }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
