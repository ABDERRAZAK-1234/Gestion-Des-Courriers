const User = require('../models/User');
require('../models/Role');

const { verifyToken } = require('../utils/jwt');

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Access denied. No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id)
            .select('-password')
            .populate('roleId')
            .populate('serviceId');

        if (!user) {
            return res.status(401).json({
                message: 'Invalid token. User not found'
            });
        }

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({
                message: 'User account is inactive'
            });
        }

        req.user = user;

        next();
    } catch (err) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
}


module.exports = {
    protect
};
