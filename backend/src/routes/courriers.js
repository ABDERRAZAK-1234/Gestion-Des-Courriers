const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const {
    createIncomingCourrier,
    createOutgoingCourrier,
    getAllCourriers,
    updateCourrier,
    softDeleteCourrier
} = require('../controllers/courrierController');

const router = express.Router();

router.post('/entrant', protect, authorizeRoles('SECRETAIRE'), createIncomingCourrier);
router.post('/sortant', protect, authorizeRoles('SECRETAIRE'), createOutgoingCourrier);
router.get('/', protect, getAllCourriers);
router.put('/:id', protect, authorizeRoles('SECRETAIRE'), updateCourrier);
router.delete('/:id', protect, authorizeRoles('ADMIN'), softDeleteCourrier);

// router.get('/', (req, res) => {
//     res.json({
//         message: 'Route courriers'
//     });
// });

module.exports = router;
