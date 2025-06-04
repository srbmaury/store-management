const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0, // price per unit at sale time
  },
});

const SaleSchema = new mongoose.Schema({
  items: [SaleItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  customerName: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  storeOwnerId: { // ✅ this is essential
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

SaleSchema.index({ customerName: 'text', date: 1, totalAmount: 1 });

module.exports = mongoose.models.Sale || mongoose.model('Sale', SaleSchema);
