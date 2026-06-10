const Notification = require('../models/Notification');

const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user._id
        })
            .populate('courrierId', 'reference objet statut type')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: notifications.length,
            notifications
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to get notifications',
            error: error.message
        });
    }
};

module.exports = {
    getMyNotifications
};