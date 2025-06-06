const Inventory = require('../models/Inventory');
const Store = require('../models/Store');

// Helper to verify store ownership
async function verifyStoreOwnership(storeId, userId) {
    const store = await Store.findById(storeId);
    if (!store) throw new Error('Store not found');
    if (store.owner.toString() !== userId.toString()) {
        throw new Error('Not authorized: not the store owner');
    }
    return store;
}

// Helper to check if user has access (owner or staff)
async function verifyStoreAccess(storeId, userId) {
    const store = await Store.findById(storeId);
    if (!store) throw new Error('Store not found');
    if (
        store.owner.toString() !== userId.toString() &&
        !store.staff.some((id) => id.toString() === userId.toString())
    ) {
        throw new Error('Not authorized for this store');
    }
    return store;
}

// Create item (owner only)
exports.createItem = async (req, res) => {
    try {
        await verifyStoreOwnership(req.body.storeId, req.user._id);

        const item = await Inventory.create({
            ...req.body,
            store: req.body.storeId,
        });
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all items (owner or staff)
exports.getItems = async (req, res) => {
    try {
        const {
            storeId,
            category,
            search,
            page = 1,
            limit = 10,
            minStock,
            maxStock
        } = req.query;

        const query = {};

        // Store filter
        if (storeId) {
            query.store = storeId;
        }

        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
            ];
        }

        // Stock range filter
        if (minStock !== undefined || maxStock !== undefined) {
            query.stock = {};
            if (minStock !== undefined) query.stock.$gte = Number(minStock);
            if (maxStock !== undefined) query.stock.$lte = Number(maxStock);
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [items, total] = await Promise.all([
            Inventory.find(query).skip(skip).limit(Number(limit)),
            Inventory.countDocuments(query),
        ]);

        res.json({
            items,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single item (owner or staff)
exports.getItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const item = await Inventory.findById(req.params.id).populate('store');

        if (!item) return res.status(404).json({ message: 'Item not found' });

        await verifyStoreAccess(item.store._id, userId);

        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update item (owner only)
exports.updateItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const item = await Inventory.findById(req.params.id).populate('store');

        if (!item) return res.status(404).json({ message: 'Item not found' });

        await verifyStoreOwnership(item.store._id, userId);

        Object.assign(item, req.body);
        await item.save();

        res.json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete item (owner only)
exports.deleteItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const item = await Inventory.findById(req.params.id).populate('store');

        if (!item) return res.status(404).json({ message: 'Item not found' });

        await verifyStoreOwnership(item.store._id, userId);
        await Inventory.findByIdAndDelete(req.params.id);

        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
