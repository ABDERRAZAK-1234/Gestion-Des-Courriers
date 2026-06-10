const Affectation = require('../models/Affectation');
const Courrier = require('../models/Courrier');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createLog } = require('../services/logService');
require('../models/Service');
require('../models/Role');

const getMyAffectations = async (req, res) => {
    try {
        if (!req.user.serviceId) {
            return res.status(400).json({
                message: 'Responsable user is not assigned to a service'
            });
        }

        const affectations = await Affectation.find({
            serviceId: req.user.serviceId._id
        })
            .populate('courrierId').populate('fromUserId', 'nom prenom email')
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
        if (!req.user.serviceId) {
            return res.status(400).json({
                message: 'Responsable user is not assigned to a service'
            });
        }

        const affectation = await Affectation.findById(req.params.affectationId);

        if (!affectation) {
            return res.status(404).json({
                message: 'Affectation not found'
            });
        }

        if (affectation.serviceId.toString() !== req.user.serviceId._id.toString()) {
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

        const courrier = await Courrier.findByIdAndUpdate(
            affectation.courrierId,
            { statut: 'RECU' },
            { new: true, runValidators: true }
        );

        const acceptedAffectation = await Affectation.findById(affectation._id)
            .populate('courrierId')
            .populate('fromUserId', 'nom prenom email')
            .populate('serviceId');

        await createLog({
            userId: req.user._id,
            courrierId: affectation.courrierId,
            action: 'ACCEPTATION_RESPONSABLE',
            description: 'Affectation acceptée par le responsable'
        });

        return res.status(200).json({
            message: 'Affectation accepted successfully',
            affectation: acceptedAffectation,
            courrier
        });

        await createLog({
            userId: req.user._id,
            courrierId: affectation.courrierId,
            action: 'ACCEPTATION_RESPONSABLE',
            description: 'Affectation acceptée par le responsable'
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Failed to accept affectation',
            error: error.message
        });
    }
};

const assignAffectationToEmployee = async (req, res) => {
    try {
        const { affectationId } = req.params;
        const { employeeId, commentaire } = req.body;

        if (!req.user.serviceId) {
            return res.status(400).json({
                message: 'Responsable user is not assigned to a service'
            });
        }

        if (!employeeId) {
            return res.status(400).json({
                message: 'EmployeeId is required'
            });
        }

        const affectation = await Affectation.findById(affectationId)
            .populate('courrierId');

        if (!affectation) {
            return res.status(404).json({
                message: 'Affectation not found'
            });
        }

        if (affectation.serviceId.toString() !== req.user.serviceId._id.toString()) {
            return res.status(403).json({
                message: 'You are not allowed to assign this affectation'
            });
        }

        if (affectation.statutReception !== 'ACCEPTE') {
            return res.status(400).json({
                message: 'Affectation must be accepted before assigning it to an employee'
            });
        }

        const employee = await User.findById(employeeId).populate('roleId');

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        if (employee.status !== 'ACTIVE') {
            return res.status(400).json({
                message: 'Employee account is inactive'
            });
        }

        if (!employee.roleId || employee.roleId.nom !== 'EMPLOYE') {
            return res.status(400).json({
                message: 'Selected user must have EMPLOYE role'
            });
        }

        if (!employee.serviceId || employee.serviceId.toString() !== req.user.serviceId._id.toString()) {
            return res.status(400).json({
                message: 'Employee must belong to the same service'
            });
        }

        const employeeAffectation = await Affectation.create({
            courrierId: affectation.courrierId._id,
            fromUserId: req.user._id,
            toUserId: employee._id,
            serviceId: req.user.serviceId._id,
            commentaire
        });

        const courrier = await Courrier.findByIdAndUpdate(
            affectation.courrierId._id,
            { statut: 'EN_COURS' },
            { new: true, runValidators: true }
        );

        const notification = await Notification.create({
            userId: employee._id,
            courrierId: affectation.courrierId._id,
            type: 'AFFECTATION',
            message: `Courrier ${affectation.courrierId.reference} has been assigned to you`
        });

        const populatedAffectation = await Affectation.findById(employeeAffectation._id)
            .populate('courrierId')
            .populate('fromUserId', 'nom prenom email')
            .populate('toUserId', 'nom prenom email')
            .populate('serviceId');

        await createLog({
            userId: req.user._id,
            courrierId: affectation.courrierId._id,
            action: 'TRANSFERT_EMPLOYE',
            description: `Courrier transféré à ${employee.nom} ${employee.prenom}`
        });
        
        return res.status(201).json({
            message: 'Courrier assigned to employee successfully',
            affectation: populatedAffectation,
            courrier,
            notification
        });


    } catch (error) {
        return res.status(500).json({
            message: 'Failed to assign courrier to employee',
            error: error.message
        });
    }
};

module.exports = {
    getMyAffectations,
    acceptAffectation,
    assignAffectationToEmployee
};