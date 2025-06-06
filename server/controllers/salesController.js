const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const Store = require('../models/Store');

exports.createSale = async (req, res) => {
	try {
		const userId = req.user._id;
		const { items, totalAmount, customerName, storeId } = req.body;

		if (!items || !Array.isArray(items) || items.length === 0) {
			return res.status(400).json({ message: 'Sale must have at least one item.' });
		}

		// Validate each item and update stock
		for (const saleItem of items) {
			const inventoryItem = await Inventory.findOne({
				_id: saleItem.item,
				store: storeId,
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

		// Create sale
		const sale = new Sale({
			items,
			totalAmount,
			customerName,
			createdBy: userId,
			store: storeId,
		});

		await sale.save();
		res.status(201).json(sale);
	} catch (error) {
		console.error('Error creating sale:', error);
		res.status(400).json({ message: error.message || 'Server error' });
	}
};

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
			storeId,
		} = req.query;

		const userId = req.user._id;

		// Fetch all stores user has access to (owner or staff)
		const stores = await Store.find({
			$or: [{ owner: userId }, { staff: userId }],
		}).select('_id');

		if (!stores.length) {
			return res.json({ sales: [], total: 0, page: 1, totalPages: 0 });
		}

		const accessibleStoreIds = stores.map((s) => s._id.toString());

		// If storeId is provided, validate access
		if (storeId && !accessibleStoreIds.includes(storeId)) {
			return res.status(403).json({ message: 'Unauthorized store access' });
		}

		// Build query
		const query = {
			store: storeId ? storeId : { $in: accessibleStoreIds },
		};

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

		const skip = (Number(page) - 1) * Number(limit);
		const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

		const [sales, total] = await Promise.all([
			Sale.find(query)
				.populate('items.item')
				.populate({
					path: 'createdBy',
					select: 'name'
				})
				.populate({
					path: 'store',
					populate: {
						path: 'owner',
						select: '_id'
					}
				})
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
		res.status(500).json({ message: error.message || 'Server error' });
	}
};
