const express = require('express');
const { authenticateUser, requireUserType, requireCompleteProfile, optionalAuth } = require('../middleware/auth');
const { validationChains } = require('../middleware/validation');
const { getRecords, getRecordById, createRecord, updateRecord, deleteRecord } = require('../utils/database');

const router = express.Router();

/**
 * @route   GET /api/properties
 * @desc    Get all available properties with filtering and pagination
 * @access  Public (with optional authentication for personalized results)
 */
router.get('/', optionalAuth, validationChains.pagination, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            city,
            property_type,
            min_price,
            max_price,
            bedrooms,
            amenities,
            search
        } = req.query;

        // Build filters
        const filters = {
            status: 'available' // Only show available properties to public
        };

        if (city) filters.city = city;
        if (property_type) filters.property_type = property_type;
        if (bedrooms) filters.bedrooms = parseInt(bedrooms);

        // Price range filter
        if (min_price) {
            filters.price = { operator: 'gte', value: parseFloat(min_price) };
        }
        if (max_price) {
            const priceFilter = filters.price || {};
            if (priceFilter.operator === 'gte') {
                // We need both min and max, so we'll handle this in a custom way
                filters.price = { operator: 'between', min: priceFilter.value, max: parseFloat(max_price) };
            } else {
                filters.price = { operator: 'lte', value: parseFloat(max_price) };
            }
        }

        // Amenities filter (if provided as comma-separated string)
        if (amenities) {
            const amenityList = amenities.split(',').map(a => a.trim());
            filters.amenities = { operator: 'overlap', value: amenityList };
        }

        const options = {
            filters,
            orderBy: 'featured desc, created_at',
            ascending: false,
            page: parseInt(page),
            limit: parseInt(limit),
            search,
            searchColumns: ['title', 'description', 'address', 'city']
        };

        // Include landlord info in the select
        const select = `
            *,
            profiles:landlord_id (
                id,
                first_name,
                last_name,
                avatar_url
            )
        `;

        const result = await getRecords('properties', { ...options, select });

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to fetch properties',
                    code: 'FETCH_FAILED'
                }
            });
        }

        // Set pagination headers
        res.set({
            'X-Total-Count': result.metadata.total,
            'X-Page-Count': result.metadata.totalPages
        });

        res.json({
            success: true,
            data: {
                properties: result.data,
                metadata: result.metadata
            }
        });

    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch properties',
                code: 'INTERNAL_ERROR'
            }
        });
    }
});

/**
 * @route   GET /api/properties/:id
 * @desc    Get property details by ID
 * @access  Public
 */
router.get('/:id', validationChains.getById, async (req, res) => {
    try {
        const { id } = req.params;

        const select = `
            *,
            profiles:landlord_id (
                id,
                first_name,
                last_name,
                avatar_url,
                phone,
                email
            )
        `;

        const result = await getRecordById('properties', id, select);

        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Property not found',
                    code: 'PROPERTY_NOT_FOUND'
                }
            });
        }

        // Only show available properties to public, or own properties to landlords
        if (result.data.status !== 'available') {
            // Check if this is the landlord's own property
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            
            if (!token) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Property not found',
                        code: 'PROPERTY_NOT_FOUND'
                    }
                });
            }

            // We would need to verify if the user owns this property
            // For now, just return not found for non-available properties
        }

        // Increment view count (TODO: implement view tracking)
        // await updateRecord('properties', id, { 
        //     views_count: result.data.views_count + 1 
        // });

        res.json({
            success: true,
            data: {
                property: result.data
            }
        });

    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch property',
                code: 'INTERNAL_ERROR'
            }
        });
    }
});

/**
 * @route   POST /api/properties
 * @desc    Create a new property
 * @access  Private (Landlords only)
 */
router.post('/', 
    authenticateUser, 
    requireUserType('landlord'), 
    requireCompleteProfile,
    validationChains.createProperty,
    async (req, res) => {
        try {
            const propertyData = {
                ...req.body,
                landlord_id: req.user.id,
                status: 'draft' // New properties start as draft
            };

            const result = await createRecord('properties', propertyData);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to create property',
                        code: 'CREATE_FAILED'
                    }
                });
            }

            res.status(201).json({
                success: true,
                message: 'Property created successfully',
                data: {
                    property: result.data
                }
            });

        } catch (error) {
            console.error('Create property error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to create property',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   PUT /api/properties/:id
 * @desc    Update property
 * @access  Private (Property owner only)
 */
router.put('/:id',
    authenticateUser,
    requireUserType('landlord'),
    validationChains.updateProperty,
    async (req, res) => {
        try {
            const { id } = req.params;

            // Check if property exists and user owns it
            const existingProperty = await getRecordById('properties', id);
            
            if (!existingProperty.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Property not found',
                        code: 'PROPERTY_NOT_FOUND'
                    }
                });
            }

            if (existingProperty.data.landlord_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'You can only update your own properties',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    }
                });
            }

            const result = await updateRecord('properties', id, req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to update property',
                        code: 'UPDATE_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: 'Property updated successfully',
                data: {
                    property: result.data
                }
            });

        } catch (error) {
            console.error('Update property error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to update property',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete property
 * @access  Private (Property owner only)
 */
router.delete('/:id',
    authenticateUser,
    requireUserType('landlord'),
    validationChains.getById,
    async (req, res) => {
        try {
            const { id } = req.params;

            // Check if property exists and user owns it
            const existingProperty = await getRecordById('properties', id);
            
            if (!existingProperty.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Property not found',
                        code: 'PROPERTY_NOT_FOUND'
                    }
                });
            }

            if (existingProperty.data.landlord_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'You can only delete your own properties',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    }
                });
            }

            const result = await deleteRecord('properties', id);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to delete property',
                        code: 'DELETE_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: 'Property deleted successfully'
            });

        } catch (error) {
            console.error('Delete property error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to delete property',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   GET /api/properties/landlord/my-properties
 * @desc    Get current landlord's properties
 * @access  Private (Landlords only)
 */
router.get('/landlord/my-properties',
    authenticateUser,
    requireUserType('landlord'),
    validationChains.pagination,
    async (req, res) => {
        try {
            const { page = 1, limit = 20, status } = req.query;

            const filters = {
                landlord_id: req.user.id
            };

            if (status) {
                filters.status = status;
            }

            const options = {
                filters,
                orderBy: 'created_at',
                ascending: false,
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await getRecords('properties', options);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    error: {
                        message: 'Failed to fetch properties',
                        code: 'FETCH_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    properties: result.data,
                    metadata: result.metadata
                }
            });

        } catch (error) {
            console.error('Get landlord properties error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to fetch properties',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

module.exports = router;