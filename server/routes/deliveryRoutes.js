const express = require('express');
const router = express.Router();
const { loginDeliveryBoy, getOrdersForDelivery, updateOrderStatus, getDeliveryProfile } = require('../controllers/deliveryController');
const { protectDelivery } = require('../middleware/deliveryAuth');

// Public route
router.post('/login', loginDeliveryBoy);

// Protected routes for Delivery
router.get('/profile', protectDelivery, getDeliveryProfile);
router.route('/orders')
    .get(protectDelivery, getOrdersForDelivery);

router.route('/orders/:id/status')
    .put(protectDelivery, updateOrderStatus);

module.exports = router;
