const { supabase, supabaseAdmin } = require('../config/supabase');

/**
 * Authenticate user using Supabase JWT token
 */
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Access token is required',
                    code: 'MISSING_TOKEN'
                }
            });
        }

        // Verify the JWT token with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Invalid or expired token',
                    code: 'INVALID_TOKEN'
                }
            });
        }

        // Get user profile from database
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
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

        // Attach user and profile to request
        req.user = {
            ...user,
            ...profile
        };
        req.token = token;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Authentication failed',
                code: 'AUTH_ERROR'
            }
        });
    }
};

/**
 * Check if user has required user type
 * @param {string|Array} allowedTypes - User type(s) allowed ('investor', 'landlord', 'admin')
 */
const requireUserType = (allowedTypes) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Authentication required',
                    code: 'AUTH_REQUIRED'
                }
            });
        }

        const userTypes = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];
        
        if (!userTypes.includes(req.user.user_type)) {
            return res.status(403).json({
                success: false,
                error: {
                    message: `Access denied. Required user type: ${userTypes.join(' or ')}`,
                    code: 'INSUFFICIENT_PERMISSIONS'
                }
            });
        }

        next();
    };
};

/**
 * Check if user has completed their profile
 */
const requireCompleteProfile = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            }
        });
    }

    if (!req.user.profile_complete) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Please complete your profile before accessing this feature',
                code: 'INCOMPLETE_PROFILE'
            }
        });
    }

    next();
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
            
            if (user && !error) {
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (profile) {
                    req.user = { ...user, ...profile };
                    req.token = token;
                }
            }
        }

        next();
    } catch (error) {
        console.error('Optional authentication error:', error);
        next();
    }
};

module.exports = {
    authenticateUser,
    requireUserType,
    requireCompleteProfile,
    optionalAuth
};