const express = require('express');
const router = express.Router();
const { deleteTestData } = require('../controllers/testController');

// DELETE /api/test/clear
router.delete('/clear', deleteTestData);
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Test route is working' });
});


module.exports = router;
