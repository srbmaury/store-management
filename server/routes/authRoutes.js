const express = require('express');
const router = express.Router();
const { register, join, login } = require('../controllers/authController');
const { protect, staffOnly } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/join', protect, staffOnly, join);
router.post('/login', login);

module.exports = router;
