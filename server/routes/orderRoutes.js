const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, cancelOrder, adminCancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', createOrder);
router.get('/:id', getOrderById);
router.get('/', protect, getAllOrders);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/admin-cancel', protect, adminCancelOrder);
router.delete('/:id', protect, deleteOrder);

module.exports = router;
