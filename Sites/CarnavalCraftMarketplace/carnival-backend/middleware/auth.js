router.post('/register', async (req, res) => {
  try {
    console.log('Real registration attempt:', req.body);
    
    const { email, password, firstName, lastName, carnivalGroupId, city } = req.body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Email, password, first name, and last name are required' 
      });
    }

    // Import models
    const { User, CarnivalGroup } = require('../models');

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Get carnival group
    let groupId = carnivalGroupId;
    if (!groupId) {
      const defaultGroup = await CarnivalGroup.findOne();
      if (defaultGroup) {
        groupId = defaultGroup.id;
      }
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      carnivalGroupId: groupId,
      city: city || null
    });

    // Generate token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'carnival-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      success: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Server error during registration',
      details: error.message 
    });
  }
});