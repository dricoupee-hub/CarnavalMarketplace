// routes/carnivalGroups.js - Working carnival groups routes
const express = require('express');
const { CarnivalGroup, User } = require('../models');

const router = express.Router();

// @route   GET /api/carnival-groups
// @desc    Get all carnival groups for registration dropdown
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('Fetching carnival groups...');
    
    const groups = await CarnivalGroup.findAll({
      attributes: ['id', 'name', 'city', 'province', 'country', 'verified'],
      order: [['name', 'ASC']]
    });

    console.log(`Found ${groups.length} carnival groups`);
    
    res.json({
      success: true,
      count: groups.length,
      groups: groups
    });
    
  } catch (error) {
    console.error('Error fetching carnival groups:', error);
    res.status(500).json({ 
      error: 'Server error while fetching carnival groups',
      details: error.message 
    });
  }
});

// @route   GET /api/carnival-groups/:id
// @desc    Get specific carnival group details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const group = await CarnivalGroup.findByPk(req.params.id, {
      attributes: ['id', 'name', 'city', 'province', 'country', 'description', 'website', 'verified', 'createdAt'],
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName'],
        where: { isActive: true },
        required: false
      }]
    });

    if (!group) {
      return res.status(404).json({ error: 'Carnival group not found' });
    }

    res.json({
      success: true,
      group: group
    });
    
  } catch (error) {
    console.error('Error fetching carnival group:', error);
    res.status(500).json({ 
      error: 'Server error while fetching carnival group',
      details: error.message 
    });
  }
});

module.exports = router;