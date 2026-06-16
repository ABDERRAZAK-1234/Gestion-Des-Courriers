const Affectation = require('../models/Affectation');
const Courrier = require('../models/Courrier');
const { createLog } = require('../services/logService');
const { assertCanChangeStatus } = require('../services/workflowService');
require('../models/Service');
require('../models/User');

const getMyAffectations = async (req, res) => {
    try {
        const affectations = await Affectation.find({
            toUserId: req.user._id
        })
            .populate('courrierId')
            .populate('fromUserId', 'nom prenom email')
            .populate('toUserId', 'nom prenom email')
            .populate('serviceId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: affectations.length,
            affectations
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to get affectations',
            error: error.message
        });
    }
};

const acceptAffectation = async (req, res) => {
    try {
        const affectation = await Affectation.findById(req.params.affectationId);

        if (!affectation) {
            return res.status(404).json({
                message: 'Affectation not found'
            });
        }

        if (!affectation.toUserId || affectation.toUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You are not allowed to accept this affectation'
            });
        }

        if (affectation.statutReception === 'ACCEPTE') {
            return res.status(400).json({
                message: 'Affectation already accepted'
            });
        }

        affectation.statutReception = 'ACCEPTE';
        affectation.dateReception = new Date();
        await affectation.save();

        const acceptedAffectation = await Affectation.findById(affectation._id)
            .populate('courrierId')
            .populate('fromUserId', 'nom prenom email')
            .populate('toUserId', 'nom prenom email')
            .populate('serviceId');

        return res.status(200).json({
            message: 'Affectation accepted successfully',
            affectation: acceptedAffectation
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to accept affectation',
            error: error.message
        });
    }
};

const traiterAffectation = async (req, res) => {
    try {
        const { commentaireTraitement } = req.body;

        const affectation = await Affectation.findById(req.params.affectationId);

        if (!affectation) {
            return res.status(404).json({
                message: 'Affectation not found'
            });
        }

        if (!affectation.toUserId || affectation.toUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'You are not allowed to treat this affectation'
            });
        }

        if (affectation.statutReception !== 'ACCEPTE') {
            return res.status(400).json({
                message: 'Affectation must be accepted before treatment'
            });
        }

        if (affectation.dateTraitement) {
            return res.status(400).json({
                message: 'Affectation already treated'
            });
        }

        affectation.commentaireTraitement = commentaireTraitement;
        affectation.dateTraitement = new Date();
        await affectation.save();

        const courrierToUpdate = await Courrier.findById(affectation.courrierId);

        assertCanChangeStatus(courrierToUpdate, 'TRAITE');

        courrierToUpdate.statut = 'TRAITE';
        await courrierToUpdate.save();

        const courrier = courrierToUpdate;

        const treatedAffectation = await Affectation.findById(affectation._id)
            .populate('courrierId')
            .populate('fromUserId', 'nom prenom email')
            .populate('toUserId', 'nom prenom email')
            .populate('serviceId');

        await createLog({
            userId: req.user._id,
            courrierId: affectation.courrierId,
            action: 'TRAITEMENT_COURRIER',
            description: commentaireTraitement || 'Courrier traité par employé'
        });

        return res.status(200).json({
            message: 'Affectation treated successfully',
            affectation: treatedAffectation,
            courrier
        });


    } catch (error) {
        if (error.message.startsWith('Invalid workflow transition')) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: 'Failed to treat affectation',
            error: error.message
        });
    }
};

module.exports = {
    getMyAffectations,
    acceptAffectation,
    traiterAffectation
};