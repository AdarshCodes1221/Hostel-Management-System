const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query;
    
    // If user is not admin, show only their bookings
    if (req.user.role !== 'admin') {
      query = Booking.find({ user: req.user.id }).populate({
        path: 'room',
        select: 'roomNumber type price'
      }).populate({
        path: 'hostel',
        select: 'name address city'
      });
    } else {
      query = Booking.find().populate({
        path: 'user',
        select: 'firstName lastName email prn'
      }).populate({
        path: 'room',
        select: 'roomNumber type price'
      }).populate({
        path: 'hostel',
        select: 'name address city'
      });
    }
    
    const bookings = await query;
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'room',
      select: 'roomNumber type price'
    }).populate({
      path: 'hostel',
      select: 'name address city'
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Check if room exists
    const room = await Room.findById(req.body.room);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check if room is available
    if (!room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available'
      });
    }
    
    // Calculate total price
    const checkInDate = new Date(req.body.checkInDate);
    const checkOutDate = new Date(req.body.checkOutDate);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking dates provided'
      });
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const days = Math.ceil((checkOutDate - checkInDate) / millisecondsPerDay);
    
    if (days <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }
    
    req.body.totalPrice = days * room.price;
    req.body.hostel = room.hostel;
    
    // Create booking
    const booking = await Booking.create(req.body);
    
    // Update room availability
    await Room.findByIdAndUpdate(req.body.room, { isAvailable: false });
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }
    
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Update booking status
    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Cancelled';
    await booking.save();
    
    // Update room availability
    await Room.findByIdAndUpdate(booking.room, { isAvailable: true });
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};