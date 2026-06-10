const Log = require('../models/Log');

const createLog = async ({ userId, courrierId, action, description }) => {
    return Log.create({
        userId,
        courrierId,
        action,
        description
    });
};

module.exports = {
    createLog
};