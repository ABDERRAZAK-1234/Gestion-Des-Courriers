const Courrier = require('../models/Courrier');
require('../models/User');
const { generateCourrierReference } = require('../utils/reference');

const createCourrierByType = async (req, res, type) => {
    try {
        const {
            objet,
            description,
            nameFile,
            filePath
        } = req.body;

        if (!objet || !nameFile) {
            return res.status(400).json({
                message: 'Reference, objet and nameFile are required'
            });
        }

        const reference = await generateCourrierReference(type);

        const courrier = await Courrier.create({
            reference,
            type,
            objet,
            description,
            nameFile,
            filePath,
            createdBy: req.user._id
        });

        const createdCourrier = await Courrier.findById(courrier._id)
            .populate('createdBy', 'nom prenom email')
            .populate('serviceId');

        return res.status(201).json({
            message: `${type === 'ENTRANT' ? 'Incoming' : 'Outgoing'} courrier created successfully`,
            courrier: createdCourrier
        });
    } catch (error) {
        return res.status(500).json({
            message: `Failed to create ${type === 'ENTRANT' ? 'incoming' : 'outgoing'} courrier`,
            error: error.message
        });
    }
};

const createIncomingCourrier = async (req, res) => {
    return createCourrierByType(req, res, 'ENTRANT');
};

const createOutgoingCourrier = async (req, res) => {
    return createCourrierByType(req, res, 'SORTANT');
};

const getAllCourriers = async (req, res) => {
    try {
        const { type, statut, search } = req.query;

        const filter = {
            isDeleted: false
        };

        if (type) {
            filter.type = type;
        }

        if (statut) {
            filter.statut = statut;
        }

        if (search) {
            filter.$or = [
                { reference: { $regex: search, $options: 'i' } },
                { objet: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const courriers = await Courrier.find(filter)
            .populate('createdBy', 'nom prenom email')
            .populate('serviceId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: courriers.length,
            courriers
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to get courriers',
            error: error.message
        });
    }
};

const updateCourrier = async (req, res) => {
    try {
        const allowedFields = [
            'objet',
            'description',
            'nameFile',
            'filePath'
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'No fields provided for update'
            });
        }

        const courrier = await Courrier.findOneAndUpdate(
            {
                _id: req.params.id,
                isDeleted: false
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        )
            .populate('createdBy', 'nom prenom email')
            .populate('serviceId');

        if (!courrier) {
            return res.status(404).json({
                message: 'Courrier not found'
            });
        }

        return res.status(200).json({
            message: 'Courrier updated successfully',
            courrier
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update courrier',
            error: error.message
        });
    }
};

const softDeleteCourrier = async (req, res) => {
    try {
        const courrier = await Courrier.findOneAndUpdate(
            {
                _id: req.params.id,
                isDeleted: false
            },
            {
                isDeleted: true
            },
            {
                new: true,
                runValidators: true
            }
        )
            .populate('createdBy', 'nom prenom email')
            .populate('serviceId');

        if (!courrier) {
            return res.status(404).json({
                message: 'Courrier not found'
            });
        }

        return res.status(200).json({
            message: 'Courrier deleted successfully',
            courrier
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete courrier',
            error: error.message
        });
    }
};

module.exports = {
    createIncomingCourrier,
    createOutgoingCourrier,
    getAllCourriers,
    updateCourrier,
    softDeleteCourrier
};
