const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: errors.array().map(error => ({
                    field: error.path,
                    message: error.msg,
                    value: error.value
                }))
            }
        });
    }
    
    next();
};

/**
 * Common validation rules
 */
const validationRules = {
    // UUID validation
    uuid: (field = 'id') => param(field).isUUID().withMessage(`${field} must be a valid UUID`),
    
    // Email validation
    email: (field = 'email') => body(field).isEmail().normalizeEmail().withMessage('Must be a valid email address'),
    
    // Phone validation (UK format)
    phone: (field = 'phone') => body(field)
        .optional()
        .matches(/^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/)
        .withMessage('Must be a valid UK phone number'),
    
    // Password validation
    password: (field = 'password') => body(field)
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    // Name validation
    name: (field) => body(field)
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage(`${field} must be between 1 and 100 characters`)
        .matches(/^[a-zA-Z\s\-'\.]+$/)
        .withMessage(`${field} can only contain letters, spaces, hyphens, apostrophes, and periods`),
    
    // User type validation
    userType: (field = 'user_type') => body(field)
        .isIn(['investor', 'landlord', 'tenant'])
        .withMessage('User type must be investor, landlord, or tenant'),
    
    // Property validation
    propertyType: (field = 'property_type') => body(field)
        .isIn(['Studio', '1BR', '2BR', '3BR+', 'House'])
        .withMessage('Property type must be Studio, 1BR, 2BR, 3BR+, or House'),
    
    propertyStatus: (field = 'status') => body(field)
        .optional()
        .isIn(['draft', 'pending_approval', 'available', 'rented', 'maintenance', 'archived'])
        .withMessage('Invalid property status'),
    
    // Monetary amounts
    price: (field = 'price') => body(field)
        .isFloat({ min: 0, max: 100000 })
        .withMessage(`${field} must be between 0 and 100,000`),
    
    // Pagination
    page: () => query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    limit: () => query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    // Date validation
    date: (field) => body(field)
        .optional()
        .isISO8601()
        .withMessage(`${field} must be a valid date`),
    
    // Text fields
    text: (field, options = {}) => {
        const { min = 0, max = 1000, optional = true } = options;
        let validation = body(field).trim();
        
        if (optional) {
            validation = validation.optional();
        }
        
        return validation
            .isLength({ min, max })
            .withMessage(`${field} must be between ${min} and ${max} characters`);
    },
    
    // Array validation
    array: (field, options = {}) => {
        const { min = 0, max = 50, optional = true } = options;
        let validation = body(field);
        
        if (optional) {
            validation = validation.optional();
        }
        
        return validation
            .isArray({ min, max })
            .withMessage(`${field} must be an array with ${min} to ${max} items`);
    }
};

/**
 * Specific validation chains for common operations
 */
const validationChains = {
    // Profile validation
    createProfile: [
        validationRules.email(),
        validationRules.name('first_name'),
        validationRules.name('last_name'),
        validationRules.phone(),
        validationRules.userType(),
        handleValidationErrors
    ],
    
    updateProfile: [
        validationRules.name('first_name').optional(),
        validationRules.name('last_name').optional(),
        validationRules.phone(),
        validationRules.text('bio', { max: 500, optional: true }),
        validationRules.text('location', { max: 200, optional: true }),
        handleValidationErrors
    ],
    
    // Property validation
    createProperty: [
        validationRules.text('title', { min: 5, max: 200, optional: false }),
        validationRules.text('description', { min: 10, max: 2000, optional: false }),
        validationRules.text('address', { min: 5, max: 200, optional: false }),
        validationRules.text('city', { min: 2, max: 100, optional: false }),
        validationRules.text('state', { min: 2, max: 100, optional: false }),
        validationRules.price(),
        validationRules.price('deposit'),
        validationRules.propertyType(),
        body('bedrooms').isInt({ min: 0, max: 20 }).withMessage('Bedrooms must be between 0 and 20'),
        body('bathrooms').isFloat({ min: 0, max: 20 }).withMessage('Bathrooms must be between 0 and 20'),
        validationRules.array('amenities', { optional: true }),
        validationRules.array('images', { optional: true }),
        handleValidationErrors
    ],
    
    updateProperty: [
        validationRules.uuid(),
        validationRules.text('title', { min: 5, max: 200, optional: true }),
        validationRules.text('description', { min: 10, max: 2000, optional: true }),
        validationRules.propertyStatus(),
        handleValidationErrors
    ],
    
    // Investment validation
    createInvestment: [
        validationRules.uuid('property_id'),
        body('amount').isFloat({ min: 100, max: 10000000 }).withMessage('Investment amount must be between £100 and £10,000,000'),
        body('percentage_share').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Percentage share must be between 0.1% and 100%'),
        body('expected_return').optional().isFloat({ min: 0, max: 50 }).withMessage('Expected return must be between 0% and 50%'),
        validationRules.date('maturity_date'),
        handleValidationErrors
    ],
    
    // Application validation
    createApplication: [
        validationRules.uuid('property_id'),
        body('annual_income').isFloat({ min: 0, max: 10000000 }).withMessage('Annual income must be between 0 and £10,000,000'),
        body('employment_duration_months').isInt({ min: 0, max: 600 }).withMessage('Employment duration must be between 0 and 600 months'),
        body('number_of_occupants').isInt({ min: 1, max: 20 }).withMessage('Number of occupants must be between 1 and 20'),
        validationRules.date('move_in_date'),
        handleValidationErrors
    ],
    
    // Generic validation
    getById: [
        validationRules.uuid(),
        handleValidationErrors
    ],
    
    pagination: [
        validationRules.page(),
        validationRules.limit(),
        handleValidationErrors
    ]
};

module.exports = {
    validationRules,
    validationChains,
    handleValidationErrors
};