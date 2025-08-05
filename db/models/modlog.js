const mongoose = require('mongoose');

const modlogSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  action: String, // e.g. "warn", "kick", "ban"
  reason: String,
  moderator: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ModLog', modlogSchema);
