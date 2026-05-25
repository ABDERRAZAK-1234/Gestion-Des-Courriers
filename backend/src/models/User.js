const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        nom: {
            type: String,
            required: true,
            trim: true
        },
        prenom: {
            type: String,
            required: true,
            trim: true,
        },
        telephone: String,
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        roleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE'],
            default: 'ACTIVE'
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            default: null
        }

    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);