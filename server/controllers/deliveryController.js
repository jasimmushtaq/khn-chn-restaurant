const DeliveryBoy = require('../models/DeliveryBoy');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Auth delivery boy & get token
// @route   POST /api/delivery/login
// @access  Public
exports.loginDeliveryBoy = async (req, res) => {
    try {
        const { email, password } = req.body;
        const deliveryBoy = await DeliveryBoy.findOne({ email });

        if (deliveryBoy && (await deliveryBoy.comparePassword(password))) {
            if (!deliveryBoy.isApproved) {
                return res.status(403).json({ success: false, message: 'Your account is pending approval by the administrator.' });
            }
            res.json({
                success: true,
                _id: deliveryBoy._id,
                name: deliveryBoy.name,
                email: deliveryBoy.email,
                token: generateToken(deliveryBoy._id),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all orders for delivery Dashboard
// @route   GET /api/delivery/orders
// @access  Private / Delivery
exports.getOrdersForDelivery = async (req, res) => {
    try {
        const orders = await Order.find({ status: { $in: ['prepared', 'preparing', 'delivering', 'delivered', 'received'] } })
            .sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Could not fetch orders' });
    }
};

// @desc    Update order status
// @route   PUT /api/delivery/orders/:id/status
// @access  Private / Delivery
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Ensure status is valid for delivery boy
        const validStatuses = ['received', 'preparing', 'delivering', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// @desc    Get delivery boy profile
// @route   GET /api/delivery/profile
// @access  Private / Delivery
exports.getDeliveryProfile = async (req, res) => {
    try {
        const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id).select('-password');
        if (!deliveryBoy) {
            return res.status(404).json({ success: false, message: 'Delivery boy not found' });
        }
        res.json({ success: true, deliveryBoy });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
