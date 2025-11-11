const mongoose = require('mongoose');
require('dotenv').config();
const Hostel = require('./models/Hostel'); // Adjust path as needed

// Connect to your PRODUCTION MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI_ATLAS) // ← FIXED THIS LINE
  .then(() => console.log('✅ MongoDB connected to Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Hostel data
const hostels = [
  { name: 'The Oaks Residence', location: 'North Campus', capacity: 200 },
  { name: 'Campus View Hostel', location: 'Main Campus', capacity: 150 },
  { name: 'Student Village', location: 'East Campus', capacity: 180 },
  { name: 'University Gardens', location: 'West Campus', capacity: 120 },
  { name: 'City Center Hostel', location: 'Downtown', capacity: 100 }
];

// Insert hostels
Hostel.insertMany(hostels)
  .then(() => {
    console.log('✅ Hostels added to Atlas database');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error adding hostels:', err);
    mongoose.disconnect();
  });
