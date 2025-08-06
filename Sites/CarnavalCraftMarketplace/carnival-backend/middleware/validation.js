// middleware/validation.js
const Joi = require('joi');

// Registration validation schema
const registrationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'Password is required'
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).allow('').messages({
    'string.pattern.base': 'Please provide a valid phone number'
  }),
  carnivalGroupId: Joi.string().uuid().required().messages({
    'string.guid': 'Please select a valid carnival group',
    'any.required': 'Carnival group selection is required'
  }),
  address: Joi.string().max(500).allow('').messages({
    'string.max': 'Address cannot exceed 500 characters'
  }),
  city: Joi.string().max(100).allow('').messages({
    'string.max': 'City cannot exceed 100 characters'
  }),
  postalCode: Joi.string().max(20).allow('').messages({
    'string.max': 'Postal code cannot exceed 20 characters'
  })
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Product validation schema
const productSchema = Joi.object({
  title: Joi.string().min(5).max(100).required().messages({
    'string.min': 'Product title must be at least 5 characters long',
    'string.max': 'Product title cannot exceed 100 characters',
    'any.required': 'Product title is required'
  }),
  description: Joi.string().min(20).max(2000).required().messages({
    'string.min': 'Description must be at least 20 characters long',
    'string.max': 'Description cannot exceed 2000 characters',
    'any.required': 'Product description is required'
  }),
  price: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price is required'
  }),
  condition: Joi.string().valid('new', 'like-new', 'good', 'fair', 'needs-repair').required().messages({
    'any.only': 'Please select a valid condition',
    'any.required': 'Condition is required'
  }),
  categoryId: Joi.string().uuid().required().messages({
    'string.guid': 'Please select a valid category',
    'any.required': 'Category selection is required'
  }),
  size: Joi.string().max(50).allow('').messages({
    'string.max': 'Size cannot exceed 50 characters'
  }),
  color: Joi.string().max(50).allow('').messages({
    'string.max': 'Color cannot exceed 50 characters'
  }),
  material: Joi.string().max(100).allow('').messages({
    'string.max': 'Material cannot exceed 100 characters'
  })
});

// Update product schema (all fields optional)
const updateProductSchema = Joi.object({
  title: Joi.string().min(5).max(100).messages({
    'string.min': 'Product title must be at least 5 characters long',
    'string.max': 'Product title cannot exceed 100 characters'
  }),
  description: Joi.string().min(20).max(2000).messages({
    'string.min': 'Description must be at least 20 characters long',
    'string.max': 'Description cannot exceed 2000 characters'
  }),
  price: Joi.number().positive().precision(2).messages({
    'number.positive': 'Price must be a positive number'
  }),
  condition: Joi.string().valid('new', 'like-new', 'good', 'fair', 'needs-repair').messages({
    'any.only': 'Please select a valid condition'
  }),
  categoryId: Joi.string().uuid().messages({
    'string.guid': 'Please select a valid category'
  }),
  size: Joi.string().max(50).allow('').messages({
    'string.max': 'Size cannot exceed 50 characters'
  }),
  color: Joi.string().max(50).allow('').messages({
    'string.max': 'Color cannot exceed 50 characters'
  }),
  material: Joi.string().max(100).allow('').messages({
    'string.max': 'Material cannot exceed 100 characters'
  }),
  isAvailable: Joi.boolean()
});

// Validation middleware functions
const validateRegistration = (req, res, next) => {
  const { error } = registrationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  next();
};

const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  next();
};

const validateProductUpdate = (req, res, next) => {
  const { error } = updateProductSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProduct,
  validateProductUpdate
};