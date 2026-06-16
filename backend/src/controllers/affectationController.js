const Affectation = require('../models/Affectation');
const Courrier = require('../models/Courrier');
const Notification = require('../models/Notification');
const Service = require('../models/Service');
const { createLog } = require('../services/logService');
const { assertCanChangeStatus } = require('../services/workflowService');
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
            toUserId: service.responsableId._id,
            serviceId: service._id,
            commentaire
        });

        await createLog({
            userId: req.user._id,
            courrierId: courrier._id,
            action: 'AFFECTATION_SERVICE',
            description: `Courrier ${courrier.reference} affecté au service ${service.nom}`
        });

        assertCanChangeStatus(courrier, 'TRANSMIS');

        courrier.serviceId = service._id,
            courrier.statut = 'TRANSMIS';
        await courrier.save();

        const notification = await Notification.create({
            userId: service.responsableId._id,
            courrierId: courrier._id,
            type: 'AFFECTATION',
            message: `Courrier ${courrier.reference} has been assigned to your service`
        });

        const populatedAffectation = await Affectation.findById(affectation._id)
            .populate('courrierId')
            .populate('fromUserId', 'nom prenom email')
            .populate('toUserId', 'nom prenom email')
            .populate('serviceId');

        return res.status(201).json({
            message: 'Courrier assigned successfully',
            affectation: populatedAffectation,
            notification
        });

    } catch (error) {
        if (error.message.startsWith('Invalid workflow transition')) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: 'Failed to assign courrier',
            error: error.message
        });
    }
};

module.exports = {
    affectCourrierToService
}