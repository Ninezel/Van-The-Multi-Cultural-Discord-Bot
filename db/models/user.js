const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  credits: { type: Number, default: 100 },
  lastDaily: { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);
