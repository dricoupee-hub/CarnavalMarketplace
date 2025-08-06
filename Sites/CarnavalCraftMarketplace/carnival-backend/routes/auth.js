// routes/auth.js - Working authentication routes
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, CarnivalGroup } = require('../models');

const router = express.Router();

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'carnival-secret-key',
    { expiresIn: '7d' }
  );
};

// @route   GET /api/auth
// @desc    Test auth routes
// @access  Public
router.get('/', (req, res) => {
  res.json({ 
    message: 'Auth routes working', 
    timestamp: new Date(),
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me'
    }
  });
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    
    const { email, password, firstName, lastName, phone, carnivalGroupId, address, city, postalCode } = req.body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Email, password, first name, and last name are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // For now, we'll use a default carnival group if none provided
    let groupId = carnivalGroupId;
    if (!groupId) {
      // Get the first carnival group as default
      const defaultGroup = await CarnivalGroup.findOne();
      if (defaultGroup) {
        groupId = defaultGroup.id;
        console.log('Using default carnival group:', defaultGroup.name);
      } else {
        console.log('No carnival groups found, creating a default one');
        const newGroup = await CarnivalGroup.create({
          name: 'Default Group',
          city: 'Brussels',
          country: 'Belgium',
          verified: true
        });
        groupId = newGroup.id;
      }
    } else {
      // Verify the provided carnival group exists
      const existingGroup = await CarnivalGroup.findByPk(groupId);
      if (!existingGroup) {
        console.log('Invalid carnival group ID provided, using default');
        const defaultGroup = await CarnivalGroup.findOne();
        groupId = defaultGroup ? defaultGroup.id : null;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    console.log('Creating user with data:', {
      email,
      firstName,
      lastName,
      carnivalGroupId: groupId
    });
    
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      carnivalGroupId: groupId,
      address: address || null,
      city: city || null,
      postalCode: postalCode || null
    });

    console.log('User created successfully:', user.id);

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data (without password) and token
    const userData = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: CarnivalGroup,
        attributes: ['name', 'city', 'country']
      }]
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userData,
      success: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Specific error handling
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors.map(e => e.message)
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({ 
      error: 'Server error during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with carnival group info
    const user = await User.findOne({
      where: { email },
      include: [{
        model: CarnivalGroup,
        attributes: ['name', 'city', 'country']
      }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data (without password) and token
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
      CarnivalGroup: user.CarnivalGroup,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      token,
      user: userData,
      success: true
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Server error during login',
      details: error.message 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'carnival-secret-key');
    
    // Find user
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: CarnivalGroup,
        attributes: ['name', 'city', 'country']
      }]
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/test-register
// @desc    Simple test registration
// @access  Public
router.post('/test-register', async (req, res) => {
  try {
    console.log('Test registration with body:', req.body);
    
    const { email, firstName, lastName } = req.body;
    
    // Just return success for now
    res.json({
      success: true,
      message: 'Test registration successful',
      data: { email, firstName, lastName },
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Test registration error:', error);
    res.status(500).json({ 
      error: 'Test registration failed',
      details: error.message 
    });
  }
});

module.exports = router;