const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: String, required: true }, // 'student' or 'admin'
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  registrationNumber: {
    type: String,
    required: function () { return this.role === 'student'; }
  },
  hostelName: { type: String },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: function () { return this.role === 'admin'; }
  },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
