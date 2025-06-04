const express = require('express');
const router = express.Router();
const { sendJoinRequest, getMyRequests, getPendingJoinRequests, updateJoinRequestStatus } = require('../controllers/joinRequestController');
const { protect, adminOnly, staffOnly } = require('../middleware/authMiddleware');

router.post('/', protect, staffOnly, sendJoinRequest);
router.get('/my-requests', protect, staffOnly, getMyRequests);
router.get('/pending', protect, adminOnly, getPendingJoinRequests);
router.put('/:requestId/status', protect, adminOnly, updateJoinRequestStatus);
module.exports = router;
