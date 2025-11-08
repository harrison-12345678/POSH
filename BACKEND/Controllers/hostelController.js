const Hostel = require('../Models/Hostel');

exports.getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find();
    res.status(200).json(hostels);
  } catch (err) {
    console.error('Hostel Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
