const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { validationChains } = require('../middleware/validation');
const { getRecords, getRecordById, createRecord, updateRecord, deleteRecord } = require('../utils/database');

const router = express.Router();

/**
 * @route   GET /api/favorites
 * @desc    Get user's favorite properties
 * @access  Private
 */
router.get('/',
    authenticateUser,
    validationChains.pagination,
    async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;

            const select = `
                *,
                properties:property_id (
                    id,
                    title,
                    address,
                    city,
                    price,
                    property_type,
                    bedrooms,
                    bathrooms,
                    images,
                    status,
                    available_date
                )
            `;

            const options = {
                filters: {
                    user_id: req.user.id
                },
                select,
                orderBy: 'created_at',
                ascending: false,
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await getRecords('favorites', options);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    error: {
                        message: 'Failed to fetch favorites',
                        code: 'FETCH_FAILED'
                    }
                });
            }

            // Filter out favorites where the property no longer exists or is not available
            const validFavorites = result.data.filter(favorite => 
                favorite.properties && favorite.properties.status === 'available'
            );

            res.json({
                success: true,
                data: {
                    favorites: validFavorites,
                    metadata: {
                        ...result.metadata,
                        total: validFavorites.length
                    }
                }
            });

        } catch (error) {
            console.error('Get favorites error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to fetch favorites',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   POST /api/favorites
 * @desc    Add property to favorites
 * @access  Private
 */
router.post('/',
    authenticateUser,
    async (req, res) => {
        try {
            const { property_id, notes } = req.body;

            if (!property_id) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Property ID is required',
                        code: 'MISSING_PROPERTY_ID'
                    }
                });
            }

            // Check if property exists
            const property = await getRecordById('properties', property_id);
            
            if (!property.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Property not found',
                        code: 'PROPERTY_NOT_FOUND'
                    }
                });
            }

            // Check if already in favorites
            const existingFavorites = await getRecords('favorites', {
                filters: {
                    user_id: req.user.id,
                    property_id: property_id
                }
            });

            if (existingFavorites.success && existingFavorites.data.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Property is already in your favorites',
                        code: 'ALREADY_FAVORITED'
                    }
                });
            }

            const favoriteData = {
                user_id: req.user.id,
                property_id,
                notes
            };

            const result = await createRecord('favorites', favoriteData);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to add to favorites',
                        code: 'CREATE_FAILED'
                    }
                });
            }

            res.status(201).json({
                success: true,
                message: 'Property added to favorites',
                data: {
                    favorite: result.data
                }
            });

        } catch (error) {
            console.error('Add favorite error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to add to favorites',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   PUT /api/favorites/:id
 * @desc    Update favorite (notes only)
 * @access  Private (Favorite owner only)
 */
router.put('/:id',
    authenticateUser,
    validationChains.getById,
    async (req, res) => {
        try {
            const { id } = req.params;
            const { notes } = req.body;

            // Check if favorite exists and user owns it
            const existingFavorite = await getRecordById('favorites', id);
            
            if (!existingFavorite.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Favorite not found',
                        code: 'FAVORITE_NOT_FOUND'
                    }
                });
            }

            if (existingFavorite.data.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'You can only update your own favorites',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    }
                });
            }

            const result = await updateRecord('favorites', id, { notes });

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to update favorite',
                        code: 'UPDATE_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: 'Favorite updated successfully',
                data: {
                    favorite: result.data
                }
            });

        } catch (error) {
            console.error('Update favorite error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to update favorite',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   DELETE /api/favorites/:id
 * @desc    Remove property from favorites
 * @access  Private (Favorite owner only)
 */
router.delete('/:id',
    authenticateUser,
    validationChains.getById,
    async (req, res) => {
        try {
            const { id } = req.params;

            // Check if favorite exists and user owns it
            const existingFavorite = await getRecordById('favorites', id);
            
            if (!existingFavorite.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Favorite not found',
                        code: 'FAVORITE_NOT_FOUND'
                    }
                });
            }

            if (existingFavorite.data.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'You can only remove your own favorites',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    }
                });
            }

            const result = await deleteRecord('favorites', id);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to remove from favorites',
                        code: 'DELETE_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: 'Property removed from favorites'
            });

        } catch (error) {
            console.error('Remove favorite error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to remove from favorites',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   DELETE /api/favorites/property/:property_id
 * @desc    Remove property from favorites by property ID
 * @access  Private
 */
router.delete('/property/:property_id',
    authenticateUser,
    async (req, res) => {
        try {
            const { property_id } = req.params;

            // Find the favorite record
            const existingFavorites = await getRecords('favorites', {
                filters: {
                    user_id: req.user.id,
                    property_id: property_id
                }
            });

            if (!existingFavorites.success || existingFavorites.data.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Property not found in favorites',
                        code: 'FAVORITE_NOT_FOUND'
                    }
                });
            }

            const favoriteId = existingFavorites.data[0].id;
            const result = await deleteRecord('favorites', favoriteId);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to remove from favorites',
                        code: 'DELETE_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: 'Property removed from favorites'
            });

        } catch (error) {
            console.error('Remove favorite by property ID error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to remove from favorites',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   GET /api/favorites/check/:property_id
 * @desc    Check if property is in user's favorites
 * @access  Private
 */
router.get('/check/:property_id',
    authenticateUser,
    async (req, res) => {
        try {
            const { property_id } = req.params;

            const existingFavorites = await getRecords('favorites', {
                filters: {
                    user_id: req.user.id,
                    property_id: property_id
                }
            });

            const isFavorited = existingFavorites.success && existingFavorites.data.length > 0;

            res.json({
                success: true,
                data: {
                    is_favorited: isFavorited,
                    favorite_id: isFavorited ? existingFavorites.data[0].id : null
                }
            });

        } catch (error) {
            console.error('Check favorite error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to check favorite status',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

module.exports = router;