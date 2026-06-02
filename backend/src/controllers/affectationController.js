const Affectation = require('../models/Affectation');
const Courrier = require('../models/Courrier');
const Notification = require('../models/Notification');
const Service = require('../models/Service');
require('../models/User');

const affectCourrierToService = async (req, res) => {
    try {
        const { courrierId } = req.params;
        const { serviceId, commentaire } = req.body;

        if (!serviceId) {
            return res.status(400).json({
                message: 'Service is required'
            });
        }

        const courrier = await Courrier.findOne({
            _id: courrierId,
            isDeleted: false
        });

        if (!courrier) {
            return res.status(404).json({
                message: 'Courrier not found'
            });
        }

        const service = await Service.findById(serviceId)
            .populate('responsableId')

        if (!service) {
            return res.status(404).json({
                message: 'Service not found'
            });
        }

        if (!service.responsableId) {
            return res.status(400).json({
                message: 'This service does not have a responsible'
            });
        }

        if (service.responsableId.status !== 'ACTIVE') {
            return res.status(400).json({
                message: 'Cannot assign this service because its responsible user is inactive'
            });
        }

        const affectation = await Affectation.create({
            courrierId: courrier._id,
            fromUserId: req.user._id,
            serviceId: service._id,
            commentaire
        });

        courrier.serviceId = service._id,
            courrier.statut = 'TRANSMIS';
        await courrier.save();

        const notification = await Notification.create({
            userId: service.responsableId._id,
            courrierId: courrier._id,
            type: 'AFFECTATION',
            message: `Courrier ${courrier.reference} has been assigned to your service`
        });

        return res.status(201).json({
            message: 'Courrier assigned successfully',
            affectation,
            notification
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Failed to assign courrier',
            error: error.message
        });
    }
};

module.exports = {
    affectCourrierToService
}