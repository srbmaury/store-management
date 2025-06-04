const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');

exports.deleteTestData = async (req, res) => {
  try {
    const testEmail = req.body.email;

    // 1. Find the test user
    const user = await User.findOne({ email: testEmail });

    if (!user) {
      return res.status(200).json({ message: 'Test user not found, nothing to clear.' });
    }

    // 2. Delete inventory for those stores
    await Inventory.deleteMany({ storeOwnerId: user._id });

    // 3. Delete sales for those stores
    await Sale.deleteMany({ storeOwnerId: user._id });

    // 4. Delete the user
    await User.deleteOne({ _id: user._id });

    res.status(200).json({ message: 'Test user and related data cleared.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to clear test data.' });
  }
};