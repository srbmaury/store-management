const Store = require('../models/Store');
const User = require('../models/User');

exports.getAllStores = async (req, res) => {
    try {
        const stores = await Store.find()
            .populate('owner', 'name email')
            .select('name address owner');

        res.json(stores);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyStores = async (req, res) => {
  try {
    const userId = req.user._id;

    const stores = await Store.find({ owner: userId });

    res.json({ stores });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStore = async (req, res) => {
	try {
		const storeId = req.params.id;

		const store = await Store.findById(storeId).select('name address');
		if (!store) {
			return res.status(404).json({ message: 'Store not found' });
		}

		res.json(store);
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

exports.createStore = async (req, res) => {
    try {
        const { name, address } = req.body;
        const user = req.user;

        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can create stores' });
        }

        const store = new Store({
            name,
            address,
            owner: user._id,
        });

        await store.save();
        res.status(201).json(store);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.joinStore = async (req, res) => {
    try {
        const user = req.user;
        const storeId = req.params.storeId;

        if (user.role !== 'staff') {
            return res.status(403).json({ message: 'Only staff can join stores' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        if (store.staff.includes(user._id)) {
            return res.status(400).json({ message: 'You have already joined this store' });
        }

        store.staff.push(user._id);
        await store.save();

        user.storeOwnerId = store.owner;
        await user.save();

        res.json({ message: 'Joined store successfully', storeId });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
