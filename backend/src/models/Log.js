const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        courrierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Courrier'
        },

        action: {
            type: String,
            required: true
        },

        description: String
    },
    { timestamps: true }
);

module.exports = mongoose.model('Log', logSchema);