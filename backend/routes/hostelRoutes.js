const express = require('express');
const router = express.Router();
const {
  getHostels,
  getHostel,
  createHostel,
  updateHostel,
  deleteHostel,
} = require('../controllers/hostelController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getHostels);
router.get('/:id', getHostel);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createHostel);
router.put('/:id', protect, authorize('admin'), updateHostel);
router.delete('/:id', protect, authorize('admin'), deleteHostel);

module.exports = router;