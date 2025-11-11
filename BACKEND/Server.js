const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./Config/db');

// Routes
const authRoutes = require('./Routes/authRoutes');
const hostelRoutes = require('./Routes/hostelRoutes');
const roomRoutes = require('./Routes/roomRoutes');
const roomBookings = require('./Routes/bookingRoutes');
const userRoutes = require('./Routes/userRoutes');
const uploadRoutes = require('./Routes/uploadRoutes');
const adminDashboardRoutes = require('./Routes/adminDashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://hostel-booking-system-5axm.onrender.com', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// DB Connection
connectDB();

// Log every incoming request (optional, for debugging)
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => res.json({ message: 'Server is running!' }));
app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', roomBookings);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

// Start server AFTER all setup is complete
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
