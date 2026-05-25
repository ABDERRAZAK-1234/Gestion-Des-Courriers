const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('../models/Role');
require('../models/Service');
const { generateToken } = require('../utils/jwt');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password are required"
            });
        }

        const user = await User.findOne({ email })
            .populate('roleId')
            .populate('serviceId');

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password "
            });
        }

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({
                message: "User account is inactive "
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = generateToken({
            id: user._id,
            role: user.roleId.nom
        });

        return res.status(200).json({
            message: "Login succes",
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                telephone: user.telephone,
                role: user.roleId.nom,
                status: user.status,
                service: user.serviceId ? user.serviceId.nom : null
            },
            token
        });

    } catch (error) {
        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }

};

module.exports = {
    login
};
