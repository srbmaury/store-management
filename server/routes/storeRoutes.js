const express = require('express');
const router = express.Router();
const { getAvailableStores } = require('../controllers/storeController');
const { protect, staffOnly } = require('../middleware/authMiddleware');

router.get('/available', protect, staffOnly, getAvailableStores);

module.exports = router;