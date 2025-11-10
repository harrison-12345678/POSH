// controllers/roomController.js

const { AtlasRoom } = require('../Models/Room');
const Room = AtlasRoom;

// ----------------------------
// Create new room
// ----------------------------
exports.createRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, capacity, price, description, images, amenities } = req.body;
    const hostelId = req.user.hostelId;

    const newRoom = new Room({
      hostelId,
      roomNumber,
      roomType,
      capacity,
      price,
      description,
      images: images || [],
      amenities: amenities || [],
      createdBy: req.user.id
    });

    const savedRoom = await newRoom.save();

    res.status(201).json({
      message: 'Room created successfully',
      room: savedRoom
    });

  } catch (err) {
    console.error('Create Room Error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Room number already exists in this hostel' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------------------
// Get all rooms for admin's hostel
// ----------------------------
exports.getHostelRooms = async (req, res) => {
  try {
    const hostelId = req.user.hostelId;
    const rooms = await Room.find({ hostelId });
    res.status(200).json(rooms);
  } catch (err) {
    console.error('Get Rooms Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------------------
// Get single room by ID
// ----------------------------
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.hostelId.toString() !== req.user.hostelId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.status(200).json(room);
  } catch (err) {
    console.error('Get Room Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------------------
// Update room
// ----------------------------
exports.updateRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, capacity, price, description, images, amenities, isAvailable } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.hostelId.toString() !== req.user.hostelId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { roomNumber, roomType, capacity, price, description, images, amenities, isAvailable },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
  } catch (err) {
    console.error('Update Room Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------------------
// Delete room
// ----------------------------
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.hostelId.toString() !== req.user.hostelId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (err) {
    console.error('Delete Room Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------------------
// Get all rooms (students)
// ----------------------------
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('hostelId', 'name');
    res.status(200).json(rooms);
  } catch (err) {
    console.error('Get All Rooms Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ----------------------------
// Get single room details (students)
// ----------------------------
exports.getRoomDetails = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hostelId', 'name');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json(room);
  } catch (err) {
    console.error('Get Room Details Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
