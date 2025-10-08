const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdbname');
    console.log('✅ MongoDB connected successfully', mongoose.connection.name);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Stop server if DB fails
  }
};

module.exports = connectDB;
