const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  storeOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

inventorySchema.index({ sku: 1, storeOwnerId: 1 }, { unique: true });
inventorySchema.index({ name: 'text' });         // for full-text search
inventorySchema.index({ category: 1 });          // for category filtering

module.exports = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
