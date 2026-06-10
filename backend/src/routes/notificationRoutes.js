const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    getMyNotifications
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/me', protect, getMyNotifications);

module.exports = router;