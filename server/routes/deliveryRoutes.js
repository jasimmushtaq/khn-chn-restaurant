const express = require('express');
const router = express.Router();
const { loginDeliveryBoy, getOrdersForDelivery, updateOrderStatus, getDeliveryProfile, updateDeliveryProfile, updateWorkStatus } = require('../controllers/deliveryController');
const { protectDelivery } = require('../middleware/deliveryAuth');
const upload = require('../middleware/uploadMiddleware');

// Public route
router.post('/login', loginDeliveryBoy);

// Protected routes for Delivery
router.route('/profile')
    .get(protectDelivery, getDeliveryProfile)
    .put(protectDelivery, upload.single('photo'), updateDeliveryProfile);
router.route('/orders')
    .get(protectDelivery, getOrdersForDelivery);

router.route('/status')
    .put(protectDelivery, updateWorkStatus);

router.route('/orders/:id/status')
    .put(protectDelivery, updateOrderStatus);

module.exports = router;
