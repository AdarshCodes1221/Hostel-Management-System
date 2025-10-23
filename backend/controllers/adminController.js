const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const userCount = await User.countDocuments();
    const hostelCount = await Hostel.countDocuments();
    const roomCount = await Room.countDocuments();
    const bookingCount = await Booking.countDocuments();
    
    // Get available rooms count
    const availableRoomCount = await Room.countDocuments({ isAvailable: true });
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort('-createdAt')
      .limit(5)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'room',
        select: 'roomNumber type'
      })
      .populate({
        path: 'hostel',
        select: 'name'
      });
    
    // Get booking status counts
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'Confirmed' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'Cancelled' });
    const completedBookings = await Booking.countDocuments({ bookingStatus: 'Completed' });
    
    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: userCount,
          hostels: hostelCount,
          rooms: roomCount,
          bookings: bookingCount,
          availableRooms: availableRoomCount
        },
        bookingStats: {
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
          completed: completedBookings
        },
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role (user or admin)'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is trying to delete themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};