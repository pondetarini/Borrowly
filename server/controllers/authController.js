const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../data/store');

const signToken = (id) => {
  const secret = process.env.JWT_SECRET || 'borrowly_super_secure_jwt_secret_key_2026_xyz987';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'borrower', phone = '', location = '', bio = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    const existingUser = store.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = store.create('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: ['borrower', 'owner', 'admin'].includes(role) ? role : 'borrower',
      phone,
      location,
      bio,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      reputation: { rating: 5.0, count: 0 }
    });

    const token = signToken(newUser.id);
    const { password: _, ...userSafe } = newUser;

    // Create welcome notification
    store.create('notifications', {
      recipientId: newUser.id,
      title: 'Welcome to Borrowly! 🌱',
      message: 'Explore items in your community or list what you own to start sharing.',
      type: 'system',
      link: '/explore'
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        token,
        user: userSafe
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = store.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signToken(user.id);
    const { password: _, ...userSafe } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: userSafe
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location, bio } = req.body;
    const updated = store.update('users', req.user.id, {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(location !== undefined && { location }),
      ...(bio !== undefined && { bio })
    });

    const { password: _, ...userSafe } = updated;
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: userSafe
    });
  } catch (error) {
    next(error);
  }
};
