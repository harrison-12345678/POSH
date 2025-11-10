// controllers/hostelController.js

const { AtlasHostel } = require('../Models/Hostel');
const Hostel = AtlasHostel; // 👈 All operations now only use Atlas

// ============================
// Get all hostels (Atlas only)
// ============================
exports.getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find(); // Atlas only
    res.status(200).json(hostels);
  } catch (err) {
    console.error('Hostel Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================
// Create a new hostel (Atlas only)
// ============================
exports.createHostel = async (req, res) => {
  try {
    const { name, location, capacity } = req.body;

    const newHostel = new Hostel({ name, location, capacity });
    const savedHostel = await newHostel.save();

    res.status(201).json({ message: 'Hostel created successfully', hostel: savedHostel });
  } catch (err) {
    console.error('Create Hostel Error:', err);

    if (err.code === 11000) {
      return res.status(400).json({ message: 'Hostel name already exists' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};
