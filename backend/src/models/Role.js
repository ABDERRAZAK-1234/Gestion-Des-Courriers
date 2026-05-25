const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
    {
        nom: {
            type: String,
            required: true,
            unique: true,
            enum: ['ADMIN', 'SECRETAIRE', 'RESPONSABLE', 'EMPLOYE']
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);