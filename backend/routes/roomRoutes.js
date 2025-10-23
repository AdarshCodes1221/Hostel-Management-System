const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getRooms);
router.get('/available', getAvailableRooms);
router.get('/:id', getRoom);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createRoom);
router.put('/:id', protect, authorize('admin'), updateRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

module.exports = router;