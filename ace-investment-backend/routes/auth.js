const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth endpoints (5 requests per minute)
const authRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        error: {
            message: 'Too many authentication requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED'
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: errors.array()
            }
        });
    }
    next();
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register new user with Supabase Auth + create profile
 * @access  Public
 */
router.post('/signup',
    authRateLimit,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
        body('user_type')
            .isIn(['investor', 'landlord', 'admin'])
            .withMessage('User type must be investor, landlord, or admin'),
        body('first_name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('First name must be between 2 and 50 characters'),
        body('last_name')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Last name must be between 2 and 50 characters')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { email, password, user_type, first_name, last_name, phone } = req.body;

            // Sign up user with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name,
                        last_name,
                        user_type
                    }
                }
            });

            if (authError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: authError.message,
                        code: 'SIGNUP_FAILED'
                    }
                });
            }

            if (!authData.user) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Failed to create user account',
                        code: 'USER_CREATION_FAILED'
                    }
                });
            }

            // Create profile record in database
            const { data: profileData, error: profileError } = await supabaseAdmin
                .from('profiles')
                .insert([{
                    id: authData.user.id,
                    email: authData.user.email,
                    first_name,
                    last_name,
                    user_type,
                    phone: phone || null,
                    profile_complete: false
                }])
                .select()
                .single();

            if (profileError) {
                console.error('Profile creation error:', profileError);
                // User was created but profile failed - this is handled by DB triggers typically
                return res.status(201).json({
                    success: true,
                    message: 'User created successfully. Please check your email for verification.',
                    data: {
                        user: {
                            id: authData.user.id,
                            email: authData.user.email,
                            user_type
                        },
                        needsEmailVerification: !authData.user.email_confirmed_at
                    }
                });
            }

            res.status(201).json({
                success: true,
                message: 'User created successfully. Please check your email for verification.',
                data: {
                    user: {
                        id: authData.user.id,
                        email: authData.user.email,
                        ...profileData
                    },
                    needsEmailVerification: !authData.user.email_confirmed_at
                }
            });

        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to create user account',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   POST /api/auth/signin
 * @desc    Sign in user with Supabase Auth
 * @access  Public
 */
router.post('/signin',
    authRateLimit,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { email, password } = req.body;

            // Sign in with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                return res.status(401).json({
                    success: false,
                    error: {
                        message: 'Invalid email or password',
                        code: 'INVALID_CREDENTIALS'
                    }
                });
            }

            if (!authData.user || !authData.session) {
                return res.status(401).json({
                    success: false,
                    error: {
                        message: 'Authentication failed',
                        code: 'AUTH_FAILED'
                    }
                });
            }

            // Get user profile
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !profile) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'User profile not found',
                        code: 'PROFILE_NOT_FOUND'
                    }
                });
            }

            res.json({
                success: true,
                message: 'Signed in successfully',
                data: {
                    user: {
                        id: authData.user.id,
                        email: authData.user.email,
                        ...profile
                    },
                    session: {
                        access_token: authData.session.access_token,
                        refresh_token: authData.session.refresh_token,
                        expires_at: authData.session.expires_at
                    }
                }
            });

        } catch (error) {
            console.error('Signin error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Authentication failed',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   POST /api/auth/signout
 * @desc    Sign out user
 * @access  Private
 */
router.post('/signout',
    authenticateUser,
    async (req, res) => {
        try {
            // Sign out with Supabase Auth
            const { error } = await supabaseAdmin.auth.admin.signOut(req.token);

            if (error) {
                console.error('Signout error:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        message: 'Failed to sign out',
                        code: 'SIGNOUT_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: 'Signed out successfully'
            });

        } catch (error) {
            console.error('Signout error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to sign out',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   GET /api/auth/user
 * @desc    Get current user info
 * @access  Private
 */
router.get('/user',
    authenticateUser,
    async (req, res) => {
        try {
            res.json({
                success: true,
                data: {
                    user: {
                        id: req.user.id,
                        email: req.user.email,
                        first_name: req.user.first_name,
                        last_name: req.user.last_name,
                        user_type: req.user.user_type,
                        phone: req.user.phone,
                        avatar_url: req.user.avatar_url,
                        profile_complete: req.user.profile_complete,
                        created_at: req.user.created_at,
                        updated_at: req.user.updated_at
                    }
                }
            });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to get user information',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
    authenticateUser,
    [
        body('first_name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('First name must be between 2 and 50 characters'),
        body('last_name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Last name must be between 2 and 50 characters'),
        body('phone')
            .optional()
            .isMobilePhone()
            .withMessage('Please provide a valid phone number'),
        body('bio')
            .optional()
            .isLength({ max: 500 })
            .withMessage('Bio must be less than 500 characters')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const allowedFields = ['first_name', 'last_name', 'phone', 'bio'];
            const updateData = {};
            
            // Only include allowed fields that are present in request
            Object.keys(req.body).forEach(key => {
                if (allowedFields.includes(key) && req.body[key] !== undefined) {
                    updateData[key] = req.body[key];
                }
            });

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'No valid fields provided for update',
                        code: 'NO_UPDATE_DATA'
                    }
                });
            }

            updateData.updated_at = new Date().toISOString();

            const { data: updatedProfile, error } = await supabaseAdmin
                .from('profiles')
                .update(updateData)
                .eq('id', req.user.id)
                .select()
                .single();

            if (error) {
                console.error('Profile update error:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        message: 'Failed to update profile',
                        code: 'UPDATE_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: updatedProfile
                }
            });

        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to update profile',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/forgot-password',
    authRateLimit,
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { email } = req.body;

            // Request password reset with Supabase Auth
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`
            });

            if (error) {
                console.error('Password reset error:', error);
                return res.status(400).json({
                    success: false,
                    error: {
                        message: error.message,
                        code: 'RESET_REQUEST_FAILED'
                    }
                });
            }

            // Always return success for security (don't reveal if email exists)
            res.json({
                success: true,
                message: 'If an account with that email exists, we have sent a password reset link.'
            });

        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to process password reset request',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password',
    authRateLimit,
    [
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long'),
        body('access_token')
            .notEmpty()
            .withMessage('Access token is required')
    ],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { password, access_token } = req.body;

            // Set the session with the provided token
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token: req.body.refresh_token || ''
            });

            if (sessionError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Invalid or expired reset token',
                        code: 'INVALID_TOKEN'
                    }
                });
            }

            // Update password
            const { data: updateData, error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: updateError.message,
                        code: 'PASSWORD_UPDATE_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: 'Password updated successfully'
            });

        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to reset password',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

module.exports = router;