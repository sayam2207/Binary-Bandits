const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .trim(),
  
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .trim(),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Car validation
const validateCar = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Car name must be between 1 and 100 characters')
    .trim(),
  
  body('brand')
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand must be between 1 and 50 characters')
    .trim(),
  
  body('model')
    .isLength({ min: 1, max: 50 })
    .withMessage('Model must be between 1 and 50 characters')
    .trim(),
  
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Please provide a valid year'),
  
  body('category')
    .isIn(['sports', 'luxury', 'supercar', 'tuner', 'classic', 'electric', 'suv', 'sedan', 'coupe', 'convertible'])
    .withMessage('Please provide a valid category'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  handleValidationErrors
];

// Tuning validation
const validateTuning = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Tuning name must be between 1 and 100 characters')
    .trim(),
  
  body('car')
    .notEmpty()
    .withMessage('Please provide a valid car ID'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
  
  handleValidationErrors
];

// Paint customization validation
const validatePaintCustomization = [
  body('materialName')
    .notEmpty()
    .withMessage('Material name is required'),
  
  body('color.hex')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Please provide a valid hex color'),
  
  body('finish')
    .optional()
    .isIn(['metallic', 'gloss', 'matte', 'pearl', 'chrome'])
    .withMessage('Please provide a valid finish type'),
  
  body('metallic')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Metallic value must be between 0 and 1'),
  
  body('roughness')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Roughness value must be between 0 and 1'),
  
  handleValidationErrors
];

// Performance modification validation
const validatePerformanceModification = [
  body('category')
    .isIn(['engine', 'exhaust', 'suspension', 'brakes', 'interior', 'exterior', 'electronics'])
    .withMessage('Please provide a valid performance category'),
  
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Modification name must be between 1 and 100 characters'),
  
  body('brand')
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand must be between 1 and 50 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  handleValidationErrors
];

// Firebase Document ID validation
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .notEmpty()
    .withMessage('Please provide a valid ID'),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'popularity', 'views', 'likes'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .trim(),
  
  query('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  query('tags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateCar,
  validateTuning,
  validatePaintCustomization,
  validatePerformanceModification,
  validateObjectId,
  validatePagination,
  validateSearch
};
