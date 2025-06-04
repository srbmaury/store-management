const User = require('../models/User');

exports.getAvailableStores = async (req, res) => {
  try {
    const stores = await User.find({ role: 'admin' })
      .select('storeName address _id name storeOwnerId');

    res.json(stores);
  } catch (err) {
    console.error('Error fetching stores:', err);
    res.status(500).json({ message: 'Server error' });
  }
};