const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: String,
  walletBalance: { type: Number, default: 0 },
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);
