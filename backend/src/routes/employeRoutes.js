const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const {
    getMyAffectations,
    acceptAffectation,
    traiterAffectation
} = require('../controllers/employeController');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('EMPLOYE'));

router.get('/affectations', getMyAffectations);
router.patch('/affectations/:affectationId/accept', acceptAffectation);
router.patch('/affectations/:affectationId/traiter', traiterAffectation);

module.exports = router;