const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
    {
        nom: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: String,
        responsableId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);