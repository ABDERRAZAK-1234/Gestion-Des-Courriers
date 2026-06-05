const Service = require('../models/Service');

const createService = async (req, res) => {
    try {
        const { nom, description } = req.body;

        if (!nom) {
            return res.status(400).json({
                message: 'Service name is required'
            });
        }

        const existingService = await Service.findOne({ nom });

        if (existingService) {
            return res.status(409).json({
                message: 'Service already exists'
            });
        }

        const service = await Service.create({
            nom,
            description
        });

        return res.status(201).json({
            message: 'Service created successfully',
            service
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create service',
            error: error.message
        });
    }
};

const updateService = async (req, res) => {
    try {
        const { nom, description } = req.body;

        const updates = {};

        if (nom !== undefined) {
            updates.nom = nom;
        }

        if (description !== undefined) {
            updates.description = description;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'No fields provided for update'
            });
        }

        if (updates.nom) {
            const existingService = await Service.findOne({
                nom: updates.nom,
                _id: { $ne: req.params.id }
            });

            if (existingService) {
                return res.status(409).json({
                    message: 'Service already exists'
                });
            }
        }

        const service = await Service.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!service) {
            return res.status(404).json({
                message: 'Service not found'
            });
        }

        return res.status(200).json({
            message: 'Service updated successfully',
            service
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update service',
            error: error.message
        });
    }
};

module.exports = {
    createService,
    updateService
};
