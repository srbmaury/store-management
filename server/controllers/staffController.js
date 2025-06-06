const User = require('../models/User');
const Store = require('../models/Store');
const mongoose = require('mongoose');
const JoinRequest = require('../models/JoinRequest');

exports.join = async (req, res) => {
	try {
		const { storeId } = req.body;
		const userId = req.user._id;

		if (!storeId) {
			return res.status(400).json({ message: 'Store ID is required' });
		}

		// Find the store by ID
		const store = await Store.findById(storeId);
		if (!store) {
			return res.status(404).json({ message: 'Store not found' });
		}

		// Check if user is already part of the store
		if (store.staff.includes(userId)) {
			return res.status(400).json({ message: 'You are already part of this store staff' });
		}

		// Add user to the store's staff list
		store.staff.push(userId);
		await store.save();

		// Update user's storeId
		await User.findByIdAndUpdate(userId, { storeId });

		// Remove any pending join request for this store
		await JoinRequest.deleteOne({ staffId: userId, storeId });

		res.json({ message: 'Successfully joined the store as staff' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Server error' });
	}
};

exports.getStaffForStore = async (req, res) => {
	try {
		const ownerId = req.user._id;
		const { storeId } = req.query;

		if (!storeId) {
			return res.status(400).json({ message: 'storeId is required' });
		}

		// Ensure the requesting user owns this store
		const store = await Store.findOne({ _id: storeId, owner: ownerId })
			.populate('staff', '-password');

		if (!store) {
			return res.status(404).json({ message: 'Store not found or unauthorized' });
		}

		res.json(store.staff);
	} catch (error) {
		console.error('Error fetching staff:', error);
		res.status(500).json({ message: 'Failed to fetch staff' });
	}
};

exports.fireStaff = async (req, res) => {
	try {
		const storeOwnerId = req.user._id;
		const { staffId } = req.params;
		const { storeId } = req.query;

		if (!storeId) {
			return res.status(400).json({ message: 'storeId is required' });
		}

		// Ensure the requesting user owns this store
		const store = await Store.findOne({ _id: storeId, owner: storeOwnerId })
			.populate('staff', '-password');
		
		if (!store) {
			return res.status(404).json({ message: 'Store not found' });
		}

		// Check if staff is part of store
		const staffObjectId = new mongoose.Types.ObjectId(staffId);

		if (!store.staff.some(id => id.equals(staffObjectId))) {
			return res.status(404).json({ message: 'Staff member not part of your store' });
		}

		// Remove staff from store's staff array
		store.staff = store.staff.filter(id => id.toString() !== staffId);
		await store.save();

		// Set the staff user's storeId to null
		await User.findByIdAndUpdate(staffId, { storeId: null });

		res.json({ message: 'Staff member has been fired' });
	} catch (error) {
		console.error('Error firing staff:', error);
		res.status(500).json({ message: 'Server error' });
	}
};
