const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const store = require('../data/store');
const User = require('../models/User');

const signToken = (id) => {
  const secret = process.env.JWT_SECRET || 'borrowly_super_secure_jwt_secret_key_2026_xyz987';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const body = req.body || {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = body.role || 'borrower';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const location = typeof body.location === 'string' ? body.location.trim() : '';
    const bio = typeof body.bio === 'string' ? body.bio.trim() : '';

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid name and email address.'
      });
    }

    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 6 and 128 characters.'
      });
    }

    if (!['borrower', 'owner'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please choose a valid account role.'
      });
    }

    const mongoConnected = mongoose.connection.readyState === 1;
    if (!mongoConnected && (process.env.MONGO_URI || process.env.MONGODB_URI)) {
      return res.status(503).json({
        success: false,
        message: 'Account registration is temporarily unavailable. Please try again shortly.'
      });
    }

    const existingUser = mongoConnected
      ? await User.findOne({ email }).select('_id').lean()
      : null;
    const existingStoredUser = store.findOne('users', user => user.email.toLowerCase() === email);
    if (existingUser || existingStoredUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      location,
      bio,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      reputation: { rating: 5.0, count: 0 }
    };

    let newUser;
    let userSafe;
    if (mongoConnected) {
      const savedUser = await User.create(userData);
      userSafe = {
        id: savedUser._id.toString(),
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        phone: savedUser.phone,
        location: savedUser.location,
        bio: savedUser.bio,
        avatar: savedUser.avatar,
        reputation: savedUser.reputation,
        createdAt: savedUser.createdAt
      };
      newUser = store.create('users', { ...userData, id: userSafe.id });
    } else {
      newUser = store.create('users', userData);
      const { password: _, ...safeUser } = newUser;
      userSafe = safeUser;
    }

    const token = signToken(userSafe.id);

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
    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }
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

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const mongoUser = mongoose.connection.readyState === 1
      ? await User.findOne({ email: normalizedEmail })
      : null;
    const user = mongoUser || store.findOne('users', candidate => candidate.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signToken(user.id || user._id.toString());
    const userData = mongoUser
      ? {
          id: mongoUser._id.toString(),
          name: mongoUser.name,
          email: mongoUser.email,
          role: mongoUser.role,
          phone: mongoUser.phone,
          location: mongoUser.location,
          bio: mongoUser.bio,
          avatar: mongoUser.avatar,
          reputation: mongoUser.reputation,
          createdAt: mongoUser.createdAt
        }
      : user;
    const { password: _, ...userSafe } = userData;

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
    const updates = {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(location !== undefined && { location }),
      ...(bio !== undefined && { bio })
    };
    let updated;
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(req.user.id)) {
      const mongoUser = await User.findByIdAndUpdate(
        req.user.id,
        updates,
        { new: true, runValidators: true }
      ).lean();
      if (mongoUser) {
        updated = {
          ...mongoUser,
          id: mongoUser._id.toString()
        };
        delete updated._id;
        store.update('users', req.user.id, updates);
      }
    }
    if (!updated) updated = store.update('users', req.user.id, updates);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }
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
