const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const {
    getMyAffectations,
    acceptAffectation
} = require('../controllers/employeController');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('EMPLOYE'));

router.get('/affectations', getMyAffectations);
router.patch('/affectations/:affectationId/accept', acceptAffectation);

module.exports = router;