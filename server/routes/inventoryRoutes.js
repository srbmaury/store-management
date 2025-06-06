const express = require('express');
const router = express.Router();
const { createItem, getItems, getItem, updateItem, deleteItem } = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, createItem);
router.get('/', protect, getItems);
router.get('/:id', protect, getItem);
router.put('/:id', protect, adminOnly, updateItem);
router.delete('/:id', protect, adminOnly, deleteItem);

module.exports = router;
