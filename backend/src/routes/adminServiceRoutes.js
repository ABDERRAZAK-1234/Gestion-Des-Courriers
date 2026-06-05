const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');
const {
    createService
} = require('../controllers/serviceController');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.post('/', createService);

module.exports = router;