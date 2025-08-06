const express = require('express');
const { Category } = require('../models');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'slug', 'emoji'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      categories: categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: error.message 
    });
  }
});

module.exports = router;