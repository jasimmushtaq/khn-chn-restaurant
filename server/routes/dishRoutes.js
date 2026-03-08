const express = require('express');
const router = express.Router();
const {
    getAllDishes,
    getDishById,
    createDish,
    updateDish,
    deleteDish,
} = require('../controllers/dishController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getAllDishes);
router.get('/:id', getDishById);

// Protected routes (Admin)
router.post('/', protect, upload.single('image'), createDish);
router.put('/:id', protect, upload.single('image'), updateDish);
router.delete('/:id', protect, deleteDish);

module.exports = router;
