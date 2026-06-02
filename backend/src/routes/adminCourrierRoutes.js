const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');
const { affectCourrierToService } = require('../controllers/affectationController');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.post('/:courrierId/affect', affectCourrierToService);

module.exports = router;