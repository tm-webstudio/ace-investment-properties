const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Missing required Supabase environment variables');
    process.exit(1);
}

// Create Supabase client with public/anonymous key (for regular operations)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Create Supabase client with service role key (for admin operations)
let supabaseAdmin = null;
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}

/**
 * Get authenticated Supabase client for a specific user
 * @param {string} accessToken - JWT access token
 * @returns {Object} Authenticated Supabase client
 */
const getAuthenticatedClient = (accessToken) => {
    const client = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        }
    );
    return client;
};

/**
 * Verify JWT token and get user information
 * @param {string} token - JWT token to verify
 * @returns {Object} User information or null if invalid
 */
const verifyToken = async (token) => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error) {
            console.error('Token verification error:', error);
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
};

/**
 * Get user profile by user ID
 * @param {string} userId - User UUID
 * @returns {Object} User profile or null
 */
const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Failed to get user profile:', error);
        return null;
    }
};

/**
 * Create or update user profile
 * @param {string} userId - User UUID
 * @param {Object} profileData - Profile data to upsert
 * @returns {Object} Updated profile or null
 */
const upsertUserProfile = async (userId, profileData) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                ...profileData,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
        if (error) {
            console.error('Error upserting user profile:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Failed to upsert user profile:', error);
        return null;
    }
};

/**
 * Handle database errors and return standardized response
 * @param {Object} error - Supabase error object
 * @returns {Object} Standardized error response
 */
const handleDatabaseError = (error) => {
    console.error('Database error:', error);
    
    // Map common Supabase errors to user-friendly messages
    const errorMappings = {
        '23505': 'A record with this information already exists',
        '23503': 'Referenced record not found',
        '42501': 'Insufficient permissions',
        'PGRST116': 'Record not found'
    };
    
    const userMessage = errorMappings[error.code] || 'An unexpected error occurred';
    
    return {
        success: false,
        error: {
            message: userMessage,
            code: error.code,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
    };
};

module.exports = {
    supabase,
    supabaseAdmin,
    getAuthenticatedClient,
    verifyToken,
    getUserProfile,
    upsertUserProfile,
    handleDatabaseError
};