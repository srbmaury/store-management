const JoinRequest = require('../models/JoinRequest');

exports.sendJoinRequest = async (req, res) => {
  const { storeOwnerId } = req.body;
  const staffId = req.user._id; // Comes from auth middleware

  try {
    // Check if a pending request already exists
    const existing = await JoinRequest.findOne({ staffId, storeOwnerId, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: 'You already sent a request to this store.' });
    }

    // Create new join request
    const request = new JoinRequest({ staffId, storeOwnerId });
    await request.save();

    res.status(201).json({ message: 'Request sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyRequests = async (req, res) => {
  const staffId = req.user._id; // Comes from auth middleware

  try {
    const requests = await JoinRequest.find({ staffId }).populate('storeOwnerId', 'storeName address');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingJoinRequests = async (req, res) => {
  try {
    const adminId = req.user._id; // from auth middleware
    const requests = await JoinRequest.find({
      storeOwnerId: adminId,
      status: 'pending',
    }).populate('staffId', 'name email'); // optional: get staff details

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

exports.updateJoinRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await JoinRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only storeOwner can approve/reject
    if (request.storeOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    if (status === 'approved') {
      // Add logic to link staff user to the store (see below)
      // Since you want one user = one store, this means updating
      // the staff user's store reference here.
      // For example:
      // const User = require('../models/User');
      // await User.findByIdAndUpdate(request.staffId, { storeId: req.user.storeId });
    }

    res.json({ message: `Request ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
