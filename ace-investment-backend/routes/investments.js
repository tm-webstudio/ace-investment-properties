const express = require('express');
const { authenticateUser, requireUserType, requireCompleteProfile } = require('../middleware/auth');
const { validationChains } = require('../middleware/validation');
const { getRecords, getRecordById, createRecord, updateRecord } = require('../utils/database');

const router = express.Router();

/**
 * @route   GET /api/investments
 * @desc    Get user's investments
 * @access  Private (Investors only)
 */
router.get('/',
    authenticateUser,
    requireUserType('investor'),
    validationChains.pagination,
    async (req, res) => {
        try {
            const { page = 1, limit = 20, status } = req.query;

            const filters = {
                investor_id: req.user.id
            };

            if (status) {
                filters.status = status;
            }

            const select = `
                *,
                properties:property_id (
                    id,
                    title,
                    address,
                    city,
                    price,
                    images
                )
            `;

            const options = {
                filters,
                select,
                orderBy: 'investment_date',
                ascending: false,
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await getRecords('investments', options);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    error: {
                        message: 'Failed to fetch investments',
                        code: 'FETCH_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    investments: result.data,
                    metadata: result.metadata
                }
            });

        } catch (error) {
            console.error('Get investments error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to fetch investments',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   GET /api/investments/:id
 * @desc    Get investment details
 * @access  Private (Investment owner or property owner)
 */
router.get('/:id',
    authenticateUser,
    validationChains.getById,
    async (req, res) => {
        try {
            const { id } = req.params;

            const select = `
                *,
                properties:property_id (
                    id,
                    title,
                    address,
                    city,
                    price,
                    images,
                    landlord_id
                )
            `;

            const result = await getRecordById('investments', id, select);

            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Investment not found',
                        code: 'INVESTMENT_NOT_FOUND'
                    }
                });
            }

            // Check if user has permission to view this investment
            const canView = req.user.id === result.data.investor_id ||
                           req.user.id === result.data.properties.landlord_id;

            if (!canView) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'You do not have permission to view this investment',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    investment: result.data
                }
            });

        } catch (error) {
            console.error('Get investment error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to fetch investment',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   POST /api/investments
 * @desc    Create new investment
 * @access  Private (Investors only)
 */
router.post('/',
    authenticateUser,
    requireUserType('investor'),
    requireCompleteProfile,
    validationChains.createInvestment,
    async (req, res) => {
        try {
            // Check if property exists and is available for investment
            const property = await getRecordById('properties', req.body.property_id);
            
            if (!property.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Property not found',
                        code: 'PROPERTY_NOT_FOUND'
                    }
                });
            }

            if (property.data.status !== 'available') {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Property is not available for investment',
                        code: 'PROPERTY_NOT_AVAILABLE'
                    }
                });
            }

            const investmentData = {
                ...req.body,
                investor_id: req.user.id,
                status: 'pending'
            };

            const result = await createRecord('investments', investmentData);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to create investment',
                        code: 'CREATE_FAILED'
                    }
                });
            }

            res.status(201).json({
                success: true,
                message: 'Investment created successfully',
                data: {
                    investment: result.data
                }
            });

        } catch (error) {
            console.error('Create investment error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to create investment',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   PUT /api/investments/:id
 * @desc    Update investment (for pending investments only)
 * @access  Private (Investment owner only)
 */
router.put('/:id',
    authenticateUser,
    requireUserType('investor'),
    validationChains.getById,
    async (req, res) => {
        try {
            const { id } = req.params;

            // Check if investment exists and user owns it
            const existingInvestment = await getRecordById('investments', id);
            
            if (!existingInvestment.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Investment not found',
                        code: 'INVESTMENT_NOT_FOUND'
                    }
                });
            }

            if (existingInvestment.data.investor_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'You can only update your own investments',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    }
                });
            }

            if (existingInvestment.data.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Only pending investments can be updated',
                        code: 'INVESTMENT_NOT_EDITABLE'
                    }
                });
            }

            // Only allow certain fields to be updated
            const allowedFields = ['amount', 'percentage_share', 'expected_return', 'maturity_date', 'notes'];
            const updateData = {};
            
            Object.keys(req.body).forEach(key => {
                if (allowedFields.includes(key)) {
                    updateData[key] = req.body[key];
                }
            });

            const result = await updateRecord('investments', id, updateData);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to update investment',
                        code: 'UPDATE_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: 'Investment updated successfully',
                data: {
                    investment: result.data
                }
            });

        } catch (error) {
            console.error('Update investment error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to update investment',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   PUT /api/investments/:id/status
 * @desc    Update investment status (landlord approval/rejection)
 * @access  Private (Property owner only)
 */
router.put('/:id/status',
    authenticateUser,
    requireUserType('landlord'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;

            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Status must be either approved or rejected',
                        code: 'INVALID_STATUS'
                    }
                });
            }

            // Get investment with property details
            const select = `
                *,
                properties:property_id (
                    landlord_id
                )
            `;
            
            const existingInvestment = await getRecordById('investments', id, select);
            
            if (!existingInvestment.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Investment not found',
                        code: 'INVESTMENT_NOT_FOUND'
                    }
                });
            }

            // Check if user owns the property
            if (existingInvestment.data.properties.landlord_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'You can only approve/reject investments for your own properties',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    }
                });
            }

            if (existingInvestment.data.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Only pending investments can be approved or rejected',
                        code: 'INVESTMENT_ALREADY_PROCESSED'
                    }
                });
            }

            const updateData = {
                status: status === 'approved' ? 'active' : 'cancelled',
                notes
            };

            const result = await updateRecord('investments', id, updateData);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to update investment status',
                        code: 'UPDATE_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: `Investment ${status} successfully`,
                data: {
                    investment: result.data
                }
            });

        } catch (error) {
            console.error('Update investment status error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to update investment status',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

module.exports = router;