const express = require('express');
const { authenticateUser, requireUserType, requireCompleteProfile } = require('../middleware/auth');
const { validationChains } = require('../middleware/validation');
const { getRecords, getRecordById, createRecord, updateRecord } = require('../utils/database');

const router = express.Router();

/**
 * @route   GET /api/applications
 * @desc    Get user's rental applications
 * @access  Private
 */
router.get('/',
    authenticateUser,
    validationChains.pagination,
    async (req, res) => {
        try {
            const { page = 1, limit = 20, status } = req.query;

            let filters = {};
            let select = `
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

            // Different filtering based on user type
            if (req.user.user_type === 'admin') {
                filters.admin_id = req.user.id;
            } else if (req.user.user_type === 'landlord') {
                // For landlords, we need to get applications for their properties
                // This requires a more complex query
                select += `, profiles:admin_id (
                    id,
                    first_name,
                    last_name,
                    avatar_url
                )`;
                
                // We'll need to filter by properties owned by the landlord
                // This would typically be done with a join or subquery
                // For now, we'll get all and filter in the application logic
            } else {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'Only admins and landlords can view applications',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    }
                });
            }

            if (status) {
                filters.status = status;
            }

            const options = {
                filters,
                select,
                orderBy: 'application_date',
                ascending: false,
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await getRecords('rental_applications', options);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    error: {
                        message: 'Failed to fetch applications',
                        code: 'FETCH_FAILED'
                    }
                });
            }

            // If landlord, filter applications for their properties only
            let applications = result.data;
            if (req.user.user_type === 'landlord') {
                applications = applications.filter(app => 
                    app.properties && app.properties.landlord_id === req.user.id
                );
            }

            res.json({
                success: true,
                data: {
                    applications,
                    metadata: result.metadata
                }
            });

        } catch (error) {
            console.error('Get applications error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to fetch applications',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   GET /api/applications/:id
 * @desc    Get application details
 * @access  Private (Application owner or property owner)
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
                ),
                profiles:admin_id (
                    id,
                    first_name,
                    last_name,
                    avatar_url,
                    email,
                    phone
                )
            `;

            const result = await getRecordById('rental_applications', id, select);

            if (!result.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Application not found',
                        code: 'APPLICATION_NOT_FOUND'
                    }
                });
            }

            // Check if user has permission to view this application
            const canView = req.user.id === result.data.admin_id ||
                           req.user.id === result.data.properties.landlord_id;

            if (!canView) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'You do not have permission to view this application',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    application: result.data
                }
            });

        } catch (error) {
            console.error('Get application error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to fetch application',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   POST /api/applications
 * @desc    Submit rental application
 * @access  Private (Tenants only)
 */
router.post('/',
    authenticateUser,
    requireUserType('admin'),
    requireCompleteProfile,
    validationChains.createApplication,
    async (req, res) => {
        try {
            // Check if property exists and is available
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
                        message: 'Property is not available for rent',
                        code: 'PROPERTY_NOT_AVAILABLE'
                    }
                });
            }

            // Check if user already has a pending application for this property
            const existingApplications = await getRecords('rental_applications', {
                filters: {
                    admin_id: req.user.id,
                    property_id: req.body.property_id,
                    status: { operator: 'in', value: ['pending', 'reviewing'] }
                }
            });

            if (existingApplications.success && existingApplications.data.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'You already have a pending application for this property',
                        code: 'DUPLICATE_APPLICATION'
                    }
                });
            }

            const applicationData = {
                ...req.body,
                admin_id: req.user.id,
                status: 'pending'
            };

            const result = await createRecord('rental_applications', applicationData);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to submit application',
                        code: 'CREATE_FAILED'
                    }
                });
            }

            res.status(201).json({
                success: true,
                message: 'Application submitted successfully',
                data: {
                    application: result.data
                }
            });

        } catch (error) {
            console.error('Create application error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to submit application',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   PUT /api/applications/:id
 * @desc    Update application (admin can update pending applications)
 * @access  Private (Application owner only)
 */
router.put('/:id',
    authenticateUser,
    requireUserType('admin'),
    validationChains.getById,
    async (req, res) => {
        try {
            const { id } = req.params;

            // Check if application exists and user owns it
            const existingApplication = await getRecordById('rental_applications', id);
            
            if (!existingApplication.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Application not found',
                        code: 'APPLICATION_NOT_FOUND'
                    }
                });
            }

            if (existingApplication.data.admin_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'You can only update your own applications',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    }
                });
            }

            if (!['pending', 'reviewing'].includes(existingApplication.data.status)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Only pending or reviewing applications can be updated',
                        code: 'APPLICATION_NOT_EDITABLE'
                    }
                });
            }

            // Don't allow updating certain system fields
            const disallowedFields = ['id', 'admin_id', 'property_id', 'status', 'application_date', 'reviewed_at', 'reviewed_by', 'landlord_notes'];
            const updateData = {};
            
            Object.keys(req.body).forEach(key => {
                if (!disallowedFields.includes(key)) {
                    updateData[key] = req.body[key];
                }
            });

            const result = await updateRecord('rental_applications', id, updateData);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to update application',
                        code: 'UPDATE_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: 'Application updated successfully',
                data: {
                    application: result.data
                }
            });

        } catch (error) {
            console.error('Update application error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to update application',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   PUT /api/applications/:id/status
 * @desc    Update application status (landlord approval/rejection)
 * @access  Private (Property owner only)
 */
router.put('/:id/status',
    authenticateUser,
    requireUserType('landlord'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status, landlord_notes } = req.body;

            if (!['reviewing', 'approved', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Status must be reviewing, approved, or rejected',
                        code: 'INVALID_STATUS'
                    }
                });
            }

            // Get application with property details
            const select = `
                *,
                properties:property_id (
                    landlord_id
                )
            `;
            
            const existingApplication = await getRecordById('rental_applications', id, select);
            
            if (!existingApplication.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Application not found',
                        code: 'APPLICATION_NOT_FOUND'
                    }
                });
            }

            // Check if user owns the property
            if (existingApplication.data.properties.landlord_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'You can only review applications for your own properties',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    }
                });
            }

            const updateData = {
                status,
                landlord_notes,
                reviewed_at: new Date().toISOString(),
                reviewed_by: req.user.id
            };

            const result = await updateRecord('rental_applications', id, updateData);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to update application status',
                        code: 'UPDATE_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: `Application ${status} successfully`,
                data: {
                    application: result.data
                }
            });

        } catch (error) {
            console.error('Update application status error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to update application status',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

/**
 * @route   PUT /api/applications/:id/withdraw
 * @desc    Withdraw application (admin only)
 * @access  Private (Application owner only)
 */
router.put('/:id/withdraw',
    authenticateUser,
    requireUserType('admin'),
    validationChains.getById,
    async (req, res) => {
        try {
            const { id } = req.params;

            // Check if application exists and user owns it
            const existingApplication = await getRecordById('rental_applications', id);
            
            if (!existingApplication.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Application not found',
                        code: 'APPLICATION_NOT_FOUND'
                    }
                });
            }

            if (existingApplication.data.admin_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: 'You can only withdraw your own applications',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    }
                });
            }

            if (existingApplication.data.status === 'withdrawn') {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Application is already withdrawn',
                        code: 'ALREADY_WITHDRAWN'
                    }
                });
            }

            if (existingApplication.data.status === 'approved') {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Cannot withdraw an approved application',
                        code: 'CANNOT_WITHDRAW_APPROVED'
                    }
                });
            }

            const result = await updateRecord('rental_applications', id, {
                status: 'withdrawn'
            });

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: result.error || 'Failed to withdraw application',
                        code: 'UPDATE_FAILED'
                    }
                });
            }

            res.json({
                success: true,
                message: 'Application withdrawn successfully',
                data: {
                    application: result.data
                }
            });

        } catch (error) {
            console.error('Withdraw application error:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: 'Failed to withdraw application',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }
);

module.exports = router;