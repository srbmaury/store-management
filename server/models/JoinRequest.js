const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
	staffId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	storeId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Store',
		required: true,
	},
	status: {
		type: String,
		enum: ['pending', 'approved', 'rejected'],
		default: 'pending',
	}
}, { timestamps: true });

module.exports = mongoose.models.JoinRequest || mongoose.model('JoinRequest', joinRequestSchema);
