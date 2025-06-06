const express = require('express');
const router = express.Router();

const { getAllStores, createStore, joinStore, getMyStores, getStore } = require('../controllers/storeController');
const { protect, adminOnly, staffOnly } = require('../middleware/authMiddleware');

router.get('/', protect, staffOnly, getAllStores);
router.post('/', protect, adminOnly, createStore);
router.post('/:id', protect, getStore);
router.post('/:storeId/join', protect, staffOnly, joinStore);
router.get('/my-stores', protect, adminOnly, getMyStores);

module.exports = router;
