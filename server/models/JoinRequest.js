const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  storeOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  message: String, // optional: message from staff
}, { timestamps: true });

module.exports = mongoose.models.JoinRequest || mongoose.model('JoinRequest', joinRequestSchema);
