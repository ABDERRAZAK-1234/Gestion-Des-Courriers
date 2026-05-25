const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        courrierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Courrier'
        },
        type: {
            type: String,
            enum: ['NEW_COURRIER', 'AFFECTATION', 'TRANSFERT', 'STATUS_UPDATE', 'SYSTEM_INFO'],
            required: true
        },

        message: String,

        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);