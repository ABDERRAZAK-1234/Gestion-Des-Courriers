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

module.exports = {
    createService
};