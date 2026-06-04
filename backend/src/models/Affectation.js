const mongoose = require('mongoose');

const affectationSchema = new mongoose.Schema(
    {
        courrierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Courrier',
            required: true
        },
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service'
        },
        statutReception: {
            type: String,
            enum: ['EN_ATTENTE', 'ACCEPTE'],
            default: 'EN_ATTENTE'
        },
        commentaire: String,
        dateAffectation: {
            type: Date,
            default: Date.now
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        dateReception: Date,
        commentaireTraitement: String,
        dateTraitement: Date,


    },
    { timestamps: true },
);

module.exports = mongoose.model('Affectation', affectationSchema);