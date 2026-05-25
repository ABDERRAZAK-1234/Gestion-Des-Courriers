const mongoose = require('mongoose');

const courrierSchema = new mongoose.Schema(
    {
        reference: {
            type: String,
            unique: true,
            required: true
        },
        type: {
            type: String,
            enum: ['ENTRANT', 'SORTANT'],
            required: true,
        },
        objet: {
            type: String,
            required: true,
            trim: true
        },
        description: String,
        statut: {
            type: String,
            enum: ['NOUVEAU', 'TRANSMIS', 'RECU', 'EN_COURS', 'TRAITE', 'ARCHIVE'],
            default: 'NOUVEAU'
        },
        nameFile: {
            type: String,
            required: true,
            trim: true
        },
        filePath: String,
        isDeleted: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            default: null
        },

    },
    { timestamps: true }

);

module.exports = mongoose.model('Courrier', courrierSchema);