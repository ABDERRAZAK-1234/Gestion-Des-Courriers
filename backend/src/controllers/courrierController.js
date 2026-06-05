const Courrier = require('../models/Courrier');
require('../models/User');

const createCourrierByType = async (req, res, type) => {
    try {
        const {
            reference,
            objet,
            description,
            nameFile,
            filePath
        } = req.body;

        if (!reference || !objet || !nameFile) {
            return res.status(400).json({
                message: 'Reference, objet and nameFile are required'
            });
        }

        const existingCourrier = await Courrier.findOne({ reference });

        if (existingCourrier) {
            return res.status(409).json({
                message: 'Courrier reference already exists'
            });
        }

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

module.exports = {
    createIncomingCourrier,
    createOutgoingCourrier
};
