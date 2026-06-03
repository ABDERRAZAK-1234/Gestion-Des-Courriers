const Affectation = require('../models/Affectation');
require('../models/Courrier');
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

module.exports = {
    getMyAffectations,
    acceptAffectation
};