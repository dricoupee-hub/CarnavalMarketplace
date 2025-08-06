const express = require('express');
const { Product, User, Category, CarnivalGroup } = require('../models');
const router = express.Router();

// Helper function to authenticate (simple version)
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'carnival-secret-key');
    
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all products...');
    
    const products = await Product.findAll({
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'firstName', 'lastName'],
          include: [{
            model: CarnivalGroup,
            attributes: ['name', 'city', 'country']
          }]
        },
        {
          model: Category,
          attributes: ['name', 'slug', 'emoji']
        }
      ],
      where: { isAvailable: true },
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${products.length} products`);

    res.json({
      success: true,
      products: products,
      count: products.length
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error.message 
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    console.log('Creating product:', req.body);
    console.log('User:', req.user.firstName, req.user.lastName);

    const {
      title,
      description,
      price,
      condition,
      categoryId,
      size,
      color,
      material
    } = req.body;

    // Basic validation
    if (!title || !description || !price || !categoryId) {
      return res.status(400).json({
        error: 'Title, description, price, and category are required'
      });
    }

    // Get a default category if categoryId is invalid
    let validCategoryId = categoryId;
    if (!categoryId) {
      const defaultCategory = await Category.findOne();
      if (defaultCategory) {
        validCategoryId = defaultCategory.id;
        console.log('Using default category:', defaultCategory.name);
      }
    }

    // Create product
    const product = await Product.create({
      title,
      description,
      price: parseFloat(price),
      condition: condition || 'good',
      categoryId: validCategoryId,
      size: size || null,
      color: color || null,
      material: material || null,
      sellerId: req.user.id,
      isAvailable: true
    });

    console.log('Product created successfully:', product.id);

    // Fetch complete product with relations
    const completeProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'firstName', 'lastName'],
          include: [{
            model: CarnivalGroup,
            attributes: ['name', 'city', 'country']
          }]
        },
        {
          model: Category,
          attributes: ['name', 'slug', 'emoji']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: completeProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      error: 'Failed to create product',
      details: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'firstName', 'lastName'],
          include: [{
            model: CarnivalGroup,
            attributes: ['name', 'city', 'country']
          }]
        },
        {
          model: Category,
          attributes: ['name', 'slug', 'emoji']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      product: product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      error: 'Failed to fetch product',
      details: error.message
    });
  }
});

module.exports = router;