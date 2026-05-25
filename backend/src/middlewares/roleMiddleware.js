const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roleId) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }
        const userRole = req.user.roleId.nom;

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                message: 'Access denied. Insufficient permissions'
            });
        }


        next();
    };
};

module.exports = {
    authorizeRoles
};
