const express = require('express');
const router = express.Router();
const {
    getAllPosters,
    getAllPostersAdmin,
    createPoster,
    updatePoster,
    deletePoster,
} = require('../controllers/posterController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getAllPosters);

// Protected routes (Admin)
router.get('/admin/all', protect, getAllPostersAdmin);
router.post('/', protect, upload.single('image'), createPoster);
router.put('/:id', protect, upload.single('image'), updatePoster);
router.delete('/:id', protect, deletePoster);

module.exports = router;
