const JoinRequest = require('../models/JoinRequest');
const Store = require('../models/Store');

exports.sendJoinRequest = async (req, res) => {
	const { storeId } = req.body;
	const staffId = req.user._id;

	if (!storeId) {
		return res.status(400).json({ message: 'storeId is required' });
	}

	try {
		// Check if already requested
		const existing = await JoinRequest.findOne({ staffId, storeId, status: 'pending' });
		if (existing) {
			return res.status(400).json({ message: 'You already sent a request to this store.' });
		}

		// Create new join request
		const request = new JoinRequest({ staffId, storeId });
		await request.save();

		res.status(201).json({ message: 'Request sent successfully' });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

exports.getMyRequests = async (req, res) => {
	const staffId = req.user._id;

	try {
		const requests = await JoinRequest.find({ staffId })
			.populate('storeId', 'name address owner');  // populate store details
		res.json(requests);
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

exports.getPendingJoinRequests = async (req, res) => {
	try {
		const adminId = req.user._id;
		const { storeId } = req.query;

		let storeQuery = { owner: adminId };
		if (storeId) {
			storeQuery._id = storeId;
		}

		// Find stores owned by the admin (optionally filtered by storeId)
		const stores = await Store.find(storeQuery).select('_id');
		if (!stores.length) {
			return res.status(403).json({ message: 'Not authorized to view join requests for this store' });
		}

		const storeIds = stores.map((s) => s._id);

		// Fetch pending join requests for those stores
		const requests = await JoinRequest.find({
			storeId: { $in: storeIds },
			status: 'pending',
		})
			.populate('staffId', 'name email')
			.populate('storeId', 'name');

		res.json(requests);
	} catch (err) {
		console.error('Error fetching join requests:', err);
		res.status(500).json({ message: 'Server error' });
	}
};

exports.updateJoinRequestStatus = async (req, res) => {
	try {
		const { requestId } = req.params;
		const { status } = req.body;

		if (!['approved', 'rejected'].includes(status)) {
			return res.status(400).json({ message: 'Invalid status' });
		}

		const request = await JoinRequest.findById(requestId);
		if (!request) {
			return res.status(404).json({ message: 'Request not found' });
		}

		// Verify ownership of the store
		const store = await Store.findById(request.storeId);
		if (!store) {
			return res.status(404).json({ message: 'Store not found' });
		}
		if (store.owner.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized' });
		}

		request.status = status;
		await request.save();
		res.json({ message: `Request ${status}` });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};
