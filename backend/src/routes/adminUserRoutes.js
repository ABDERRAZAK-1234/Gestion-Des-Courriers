const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    disableUser,
    enableUser
} = require('../controllers/userController');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/ban', disableUser);
router.patch('/:id/unban', enableUser);

module.exports = router;