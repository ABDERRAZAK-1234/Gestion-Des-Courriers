const express = require('express');
const { login } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, (req, res) => {
    res.status(200).json({
        message: 'Authenticated user',
        user: req.user
    });
});

module.exports = router;
