// controllers/hostelController.js

// ✅ Correct imports for dual DB setup
const { LocalHostel, AtlasHostel, saveHostelToBoth } = require('../models/Hostel');
const Hostel = LocalHostel; // use LocalHostel so your existing getHostels works

// ============================
// Get all hostels
// ============================
exports.getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find();
    res.status(200).json(hostels);
  } catch (err) {
    console.error('Hostel Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================
// Create a new hostel (saves to both Local + Atlas)
// ============================
exports.createHostel = async (req, res) => {
  try {
    const { name, location, capacity } = req.body;

    // Save to both databases
    const { local, atlas } = await saveHostelToBoth({ name, location, capacity });

    res.status(201).json({ message: 'Hostel created successfully', local, atlas });
  } catch (err) {
    console.error('Create Hostel Error:', err);

    if (err.code === 11000) {
      return res.status(400).json({ message: 'Hostel name already exists' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};
