const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const {
    createIncomingCourrier,
    createOutgoingCourrier,
    getAllCourriers,
    updateCourrier,
    softDeleteCourrier,
    getCourrierHistory,
    archiveCourrier,
    viewCourrierFile,
    downloadCourrierFile,
    getCourrierByReference
} = require('../controllers/courrierController');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/entrant', protect, authorizeRoles('SECRETAIRE'), upload.single('file'), createIncomingCourrier);
router.post('/sortant', protect, authorizeRoles('SECRETAIRE'), upload.single('file'), createOutgoingCourrier);
router.get('/', protect, getAllCourriers);
router.get('/:id/history', protect, getCourrierHistory);
router.put('/:id', protect, authorizeRoles('SECRETAIRE'), updateCourrier);
router.delete('/:id', protect, authorizeRoles('ADMIN'), softDeleteCourrier);
router.patch('/:id/archive', protect, authorizeRoles('ADMIN'), archiveCourrier);

router.get('/:id/file', protect, viewCourrierFile);
router.get('/:id/download', protect, downloadCourrierFile);

router.get(
    '/reference/:reference',
    protect,
    getCourrierByReference
);

// router.get('/', (req, res) => {
//     res.json({
//         message: 'Route courriers'
//     });
// });



module.exports = router;
