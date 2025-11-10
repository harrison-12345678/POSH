// Config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

let atlasConnection;

function connectDB() {
  if (!atlasConnection) {
    atlasConnection = mongoose.createConnection(
      process.env.MONGODB_URI_ATLAS,
      { 
        useNewUrlParser: true,
        useUnifiedTopology: true 
      }
    );

    atlasConnection.on('connected', () => {
      console.log('✅ Connected to MongoDB Atlas');
    });

    atlasConnection.on('error', (err) => {
      console.error('❌ MongoDB Atlas connection error:', err);
    });

    atlasConnection.on('disconnected', () => {
      console.log('🔌 Disconnected from MongoDB Atlas');
    });
  }

  return { atlasConnection };
}

module.exports = connectDB;