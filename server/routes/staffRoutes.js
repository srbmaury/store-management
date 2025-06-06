const express = require('express');
const router = express.Router();
const { protect, adminOnly, staffOnly } = require('../middleware/authMiddleware');
const { getStaffForStore, join, fireStaff } = require('../controllers/staffController');

router.get('/', protect, adminOnly, getStaffForStore);
router.post('/join', protect, staffOnly, join);
router.put('/fire/:staffId', protect, adminOnly, fireStaff);

module.exports = router;
