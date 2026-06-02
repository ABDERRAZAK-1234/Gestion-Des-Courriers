const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const Service = require('../models/Service');

const createUser = async (req, res) => {
    try {
        const { nom, prenom, telephone, email, password, roleId, serviceId } = req.body;

        if (!nom || !prenom || !email || !password || !roleId) {
            return res.status(400).json({
                message: 'Nom, prenom, email, password and roleId are required'
            });
        }

        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(409).json({
                message: 'Email already exists'
            });
        }

        const role = await Role.findById(roleId);

        if (!role) {
            return res.status(404).json({
                message: 'Role not found'
            });
        }

        let service = null;

        if (serviceId) {
            service = await Service.findById(serviceId);

            if (!service) {
                return res.status(404).json({
                    message: 'Service not found'
                });
            }
        }

        if (role.nom === 'RESPONSABLE' && !service) {
            return res.status(400).json({
                message: 'ServiceId is required for a responsable user'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            nom,
            prenom,
            telephone,
            email,
            password: hashedPassword,
            roleId,
            serviceId: serviceId || null
        });

        if (role.nom === 'RESPONSABLE') {
            service.responsableId = user._id;
            await service.save();
        }

        const createdUser = await User.findById(user._id)
            .select('-password').populate('roleId')
            .populate('serviceId');

        return res.status(201).json({
            message: 'User created successfully',
            user: createdUser
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create User',
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('roleId')
            .populate('serviceId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: users.length,
            users
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to get users',
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('roleId')
            .populate({
                path: 'serviceId',
                populate: {
                    path: 'responsableId',
                    select: '-password'
                }
            });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to get user',
            error: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const allowedFields = [
            'nom',
            'prenom',
            'telephone',
            'email',
            'roleId',
            'serviceId',
            'status'
        ];

        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (updates.email) {
            const existingUser = await User.findOne({
                email: updates.email,
                _id: { $ne: req.params.id }
            });

            if (existingUser) {
                return res.status(409).json({
                    message: 'Email already exists'
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        )
            .select('-password')
            .populate('roleId')
            .populate('serviceId');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update user',
            error: error.message
        });
    }
};

const disableUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'INACTIVE' },
            {
                new: true,
                runValidators: true
            }
        )
            .select('-password')
            .populate('roleId')
            .populate('serviceId');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            message: 'User disabled successfully',
            user
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to disable user',
            error: error.message
        });
    }
};

const enableUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'ACTIVE' },
            { new: true, runValidators: true }
        )
            .select('-password')
            .populate('roleId')
            .populate('serviceId');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            message: 'User enabled successfully',
            user
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to enable user',
            error: error.message
        });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    disableUser,
    enableUser
};