const Courrier = require('../models/Courrier');
const Log = require('../models/Log');
require('../models/User');
const { generateCourrierReference } = require('../utils/reference');
const { assertCanChangeStatus } = require('../services/workflowService');
const Service = require('../models/Service');
const { archiveCourrierFileByService } = require('../services/archiveService');

const { buildFileMetadata } = require('../services/fileService');

const fs = require('fs');
const path = require('path');

const resolveCourrierFile = (filePath) => {
    const uploadsRoot = path.resolve(__dirname, '../../uploads');
    const absolutePath = path.resolve(filePath);

    const relativePath = path.relative(uploadsRoot, absolutePath);

    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        return null;
    }

    return absolutePath;
};

const createCourrierByType = async (req, res, type) => {
    try {
        const {
            objet,
            description
        } = req.body;

        if (!objet || !req.file) {
            return res.status(400).json({
                message: 'Objet and file are required'
            });
        }

        const reference = await generateCourrierReference(type);

        const fileMetadata = await buildFileMetadata(req.file);

        const courrier = await Courrier.create({
            reference,
            type,
            objet,
            description,
            nameFile: req.file.originalname,
            filePath: req.file.path, fileMetadata,
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

const getCourrierHistory = async (req, res) => {
    try {
        const courrier = await Courrier.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!courrier) {
            return res.status(404).json({
                message: 'Courrier not found'
            });
        }

        const logs = await Log.find({
            courrierId: courrier._id
        })
            .populate('userId', 'nom prenom email')
            .populate('courrierId', 'reference objet statut type')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            courrier: {
                id: courrier._id,
                reference: courrier.reference,
                objet: courrier.objet,
                statut: courrier.statut
            },
            count: logs.length,
            history: logs
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to get courrier history',
            error: error.message
        });
    }
};

const archiveCourrier = async (req, res) => {
    try {
        const courrier = await Courrier.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!courrier) {
            return res.status(404).json({
                message: 'Courrier not found'
            });
        }

        if (!courrier.serviceId) {
            return res.status(400).json({
                message: 'Cannot archive courrier without assigned service'
            });
        }

        const service = await Service.findById(courrier.serviceId);

        if (!service) {
            return res.status(404).json({
                message: 'Service not found'
            });
        }

        assertCanChangeStatus(courrier, 'ARCHIVE');

        const archivedPath = await archiveCourrierFileByService(courrier, service);

        if (archivedPath) {
            courrier.filePath = archivedPath;
        }

        courrier.statut = 'ARCHIVE';
        await courrier.save();

        return res.status(200).json({
            message: 'Courrier archived successfully',
            courrier
        });
    } catch (error) {
        if (error.message.startsWith('Invalid workflow transition')) {
            return res.status(400).json({
                message: 'Impossible d’archiver un courrier non traité'
            });
        }

        return res.status(500).json({
            message: 'Failed to archive courrier',
            error: error.message
        });
    }
};

const assignCourrierToService = async (req, res) => {
    try {
        const { courrierId } = req.params;
        const { serviceId } = req.body;

        if (!serviceId) {
            return res.status(400).json({
                message: 'ServiceId is required'
            });
        }

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                message: 'Service not found'
            });
        }

        const courrier = await Courrier.findOneAndUpdate(
            {
                _id: courrierId,
                isDeleted: false
            },
            {
                serviceId: service._id
            },
            {
                new: true,
                runValidators: true
            }
        )
            .populate('serviceId')
            .populate('createdBy', 'nom prenom email');

        if (!courrier) {
            return res.status(404).json({
                message: 'Courrier not found'
            });
        }

        return res.status(200).json({
            message: 'Courrier associated to service successfully',
            courrier
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to associate courrier to service',
            error: error.message
        });
    }
};

const viewCourrierFile = async (req, res) => {
    try {
        const courrier = await Courrier.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!courrier || !courrier.filePath) {
            return res.status(404).json({
                message: 'Courrier file not found'
            });
        }

        const filePath = resolveCourrierFile(courrier.filePath);

        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({
                message: 'File not found on server'
            });
        }

        return res.sendFile(filePath);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to view courrier file',
            error: error.message
        });
    }
};

const downloadCourrierFile = async (req, res) => {
    try {
        const courrier = await Courrier.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!courrier || !courrier.filePath) {
            return res.status(404).json({
                message: 'Courrier file not found'
            });
        }

        const filePath = resolveCourrierFile(courrier.filePath);

        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({
                message: 'File not found on server'
            });
        }

        return res.download(filePath, courrier.nameFile);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to download courrier file',
            error: error.message
        });
    }
};

const getCourrierByReference = async (req, res) => {
    try {
        const reference = req.params.reference.trim().toUpperCase();

        const courrier = await Courrier.findOne({
            reference,
            isDeleted: false
        })
            .populate('createdBy', 'nom prenom email')
            .populate('serviceId');

        if (!courrier) {
            return res.status(404).json({
                message: 'Courrier not found'
            });
        }

        return res.status(200).json({
            courrier
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to search courrier',
            error: error.message
        });
    }
};


module.exports = {
    createIncomingCourrier,
    createOutgoingCourrier,
    getAllCourriers,
    updateCourrier,
    softDeleteCourrier,
    getCourrierHistory,
    archiveCourrier,
    assignCourrierToService,
    viewCourrierFile,
    downloadCourrierFile,
    getCourrierByReference
};
