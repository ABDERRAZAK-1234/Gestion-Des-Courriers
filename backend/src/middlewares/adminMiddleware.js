const { authorizeRoles } = require('./roleMiddleware');

const adminOnly = authorizeRoles('ADMIN');

module.exports = {
    adminOnly
};