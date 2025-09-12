const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { validationChains } = require('../middleware/validation');
const { getRecordById, updateRecord } = require('../utils/database');

const router = express.Router();

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/', authenticateUser, async (req, res) => {
    try {
        const result = await getRecordById('profiles', req.user.id);

        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Profile not found',
                    code: 'PROFILE_NOT_FOUND'
                }
            });
        }

        res.json({
            success: true,
            data: {
                profile: result.data
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to retrieve profile',
                code: 'INTERNAL_ERROR'
            }
        });
    }
});

/**
 * @route   PUT /api/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/', authenticateUser, validationChains.updateProfile, async (req, res) => {
    try {
        const { first_name, last_name, phone, bio, location, avatar_url } = req.body;
        
        // Check if this update should mark profile as complete
        const requiredFields = [first_name, last_name, phone];
        const isComplete = requiredFields.every(field => field && field.trim());

        const updateData = {
            first_name,
            last_name,
            phone,
            bio,
            location,
            avatar_url,
            profile_complete: isComplete
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const result = await updateRecord('profiles', req.user.id, updateData);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: {
                    message: result.error || 'Failed to update profile',
                    code: 'UPDATE_FAILED'
                }
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                profile: result.data
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
});

/**
 * @route   GET /api/profile/complete
 * @desc    Mark user's profile as complete
 * @access  Private
 */
router.put('/complete', authenticateUser, async (req, res) => {
    try {
        // Verify that required fields are present
        const profile = await getRecordById('profiles', req.user.id);
        
        if (!profile.success) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Profile not found',
                    code: 'PROFILE_NOT_FOUND'
                }
            });
        }

        const { first_name, last_name, phone } = profile.data;
        
        if (!first_name || !last_name || !phone) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Please complete all required fields (first name, last name, phone)',
                    code: 'INCOMPLETE_REQUIRED_FIELDS'
                }
            });
        }

        const result = await updateRecord('profiles', req.user.id, {
            profile_complete: true
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Failed to complete profile',
                    code: 'UPDATE_FAILED'
                }
            });
        }

        res.json({
            success: true,
            message: 'Profile marked as complete',
            data: {
                profile: result.data
            }
        });

    } catch (error) {
        console.error('Complete profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to complete profile',
                code: 'INTERNAL_ERROR'
            }
        });
    }
});

/**
 * @route   GET /api/profile/:id
 * @desc    Get public profile by ID (for landlord/investor discovery)
 * @access  Private (authenticated users only)
 */
router.get('/:id', authenticateUser, validationChains.getById, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await getRecordById('profiles', id, 
            'id, first_name, last_name, user_type, bio, location, avatar_url, created_at'
        );

        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Profile not found',
                    code: 'PROFILE_NOT_FOUND'
                }
            });
        }

        // Only return public profile information
        res.json({
            success: true,
            data: {
                profile: result.data
            }
        });

    } catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to retrieve profile',
                code: 'INTERNAL_ERROR'
            }
        });
    }
});

module.exports = router;