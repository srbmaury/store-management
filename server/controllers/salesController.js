const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');

// Create Sale and reduce stock
exports.createSale = async (req, res) => {
  try {
    if (!req.user || !req.user._id || !req.user.storeOwnerId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { items, totalAmount, customerName } = req.body;

    const userId = req.user._id;
    const storeOwnerId = req.user.storeOwnerId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Sale must have at least one item.' });
    }

    for (const saleItem of items) {
      const inventoryItem = await Inventory.findOne({
        _id: saleItem.item,
        storeOwnerId: storeOwnerId,
      });

      if (!inventoryItem) {
        return res.status(404).json({
          message: `Inventory item with ID ${saleItem.item} not found in this store.`,
        });
      }

      if (inventoryItem.stock < saleItem.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${inventoryItem.name}`,
        });
      }

      inventoryItem.stock -= saleItem.quantity;
      await inventoryItem.save();
    }

    // ✅ Create sale
    const sale = new Sale({
      items,
      totalAmount,
      customerName,
      createdBy: userId,
      storeOwnerId: storeOwnerId,
    });

    await sale.save();

    res.status(201).json(sale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all sales with filtering, sorting, and pagination
exports.getSales = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customerName,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      sortBy = 'date',
      order = 'desc',
    } = req.query;

    const storeOwnerId = req.user.storeOwnerId;
    const currentUserId = req.user._id.toString();

    const query = { storeOwnerId };

    if (customerName) {
      query.customerName = { $regex: customerName, $options: 'i' };
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    if (minTotal || maxTotal) {
      query.totalAmount = {};
      if (minTotal) query.totalAmount.$gte = Number(minTotal);
      if (maxTotal) query.totalAmount.$lte = Number(maxTotal);
    }

    const skip = (page - 1) * limit;

    const sortOptions = {
      [sortBy]: order === 'asc' ? 1 : -1,
    };

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('items.item')
        .populate(currentUserId === storeOwnerId.toString() ? 'createdBy' : '')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Sale.countDocuments(query),
    ]);

    res.json({
      sales,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
