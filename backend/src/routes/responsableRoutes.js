const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const {
    getMyAffectations,
    acceptAffectation,
    assignAffectationToEmployee
} = require('../controllers/responsableController');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('RESPONSABLE'));

router.get('/affectations', getMyAffectations);
router.patch('/affectations/:affectationId/accept', acceptAffectation);

router.post('/affectations/:affectationId/assign-employee', assignAffectationToEmployee);

module.exports = router;