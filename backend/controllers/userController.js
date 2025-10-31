const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }

  const expiresIn = process.env.JWT_EXPIRE || '30d';
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, prn, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Check if PRN exists
    const prnExists = await User.findOne({ prn });
    if (prnExists) {
      return res.status(400).json({ success: false, message: 'PRN already registered' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      prn,
      role: role === 'admin' ? 'admin' : 'student',
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          prn: user.prn,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    // Allow login by either email or PRN for students/admins
    const { email, prn, password } = req.body;

    if (!password || (!email && !prn)) {
      return res.status(400).json({ success: false, message: 'Provide email or PRN and password' });
    }

    // Try to find by email first, otherwise by PRN
    let user = null;
    if (email) {
      user = await User.findOne({ email }).select('+password');
    }

    if (!user && prn) {
      user = await User.findOne({ prn }).select('+password');
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          prn: user.prn,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.prn = req.body.prn || user.prn;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          prn: updatedUser.prn,
          role: updatedUser.role,
          token: generateToken(updatedUser._id),
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};