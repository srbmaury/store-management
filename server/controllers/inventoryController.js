const Inventory = require('../models/Inventory');

// Create item
exports.createItem = async (req, res) => {
  try {
    const item = await Inventory.create({
      ...req.body,
      storeOwnerId: req.user.storeOwnerId,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Enhanced: Get all items with pagination, search, filter, and sorting
exports.getItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category,
      minStock,
      maxStock,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const storeOwnerId = req.user.storeOwnerId;

    // Build query
    const query = { storeOwnerId };

    if (search) {
      query.name = { $regex: search, $options: 'i' }; // case-insensitive
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (minStock || maxStock) {
      query.stock = {};
      if (minStock) query.stock.$gte = Number(minStock);
      if (maxStock) query.stock.$lte = Number(maxStock);
    }

    const skip = (page - 1) * limit;

    const sortOptions = {
      [sortBy]: order === 'asc' ? 1 : -1,
    };

    const [items, total] = await Promise.all([
      Inventory.find(query).sort(sortOptions).skip(skip).limit(Number(limit)),
      Inventory.countDocuments(query),
    ]);

    res.json({
      items,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single item (check storeOwnerId match)
exports.getItem = async (req, res) => {
  try {
    const item = await Inventory.findOne({
      _id: req.params.id,
      storeOwnerId: req.user.storeOwnerId,
    });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update item (check storeOwnerId match)
exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, storeOwnerId: req.user.storeOwnerId },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found or not accessible' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete item (check storeOwnerId match)
exports.deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findOneAndDelete({
      _id: req.params.id,
      storeOwnerId: req.user.storeOwnerId,
    });
    if (!item) return res.status(404).json({ message: 'Item not found or not accessible' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};