// Config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

let localConnection;
let atlasConnection;

function connectDB() {
  if (!localConnection) {
    localConnection = mongoose.createConnection(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdbname',
      { useNewUrlParser: true } // removed deprecated useUnifiedTopology
    );

    localConnection.once('open', () =>
      console.log('✅ Connected to Local MongoDB:', localConnection.name)
    );
  }

  if (!atlasConnection) {
    atlasConnection = mongoose.createConnection(
      process.env.MONGODB_URI_ATLAS,
      { useNewUrlParser: true }
    );

    atlasConnection.once('open', () =>
      console.log('✅ Connected to MongoDB Atlas:', atlasConnection.name)
    );
  }

  return { localConnection, atlasConnection };
}

module.exports = connectDB;
