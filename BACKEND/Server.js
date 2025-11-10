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



const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/upload', require('./Routes/uploadRoutes'));

// DB Connection
connectDB();
// Log every incoming request
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});
console.log({
  authRoutes: typeof authRoutes,
  hostelRoutes: typeof hostelRoutes,
  roomRoutes: typeof roomRoutes,
  roomBookings: typeof roomBookings,
  userRoutes: typeof userRoutes,
  adminDashboard: typeof require('./Routes/adminDashboardRoutes'),
});



// Routes
app.get('/', (req, res) => res.json({ message: 'Server is running!' }));
app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', roomBookings);
app.use('/api/users', userRoutes);
app.use("/api/admin/dashboard", require("./Routes/adminDashboardRoutes"));
