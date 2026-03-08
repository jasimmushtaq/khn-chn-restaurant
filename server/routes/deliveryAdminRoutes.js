const express = require('express');
const router = express.Router();
const { getAllDeliveryBoys, updateDeliveryBoy, deleteDeliveryBoy } = require('../controllers/deliveryAdminController');
const { protect } = require('../middleware/authMiddleware'); // admin auth

// Get all delivery boys (admin view)
router.get('/', protect, getAllDeliveryBoys);

// Update delivery boy (admin)
router.put('/:id', protect, updateDeliveryBoy);

// Delete delivery boy (admin)
router.delete('/:id', protect, deleteDeliveryBoy);

module.exports = router;
