const DeliveryBoy = require('../models/DeliveryBoy');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const { createChatRoom, closeChatRoom } = require('../services/chatRoom');

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
                token: generateToken(deliveryBoy._id),
                deliveryBoy: {
                    id: deliveryBoy._id,
                    name: deliveryBoy.name,
                    email: deliveryBoy.email
                }
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

const { setDriverStatus } = require('../services/deliveryService');

// @desc    Update order status
// @route   PUT /api/delivery/orders/:id/status
// @access  Private / Delivery
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['received', 'preparing', 'delivering', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);
        if (!deliveryBoy) return res.status(404).json({ success: false, message: 'Delivery boy not found' });

        // MANDATORY PHOTO CHECK
        if (!deliveryBoy.photoUrl) {
            return res.status(403).json({ 
                success: false, 
                message: 'Mandatory Action: Please upload your profile photo in the profile section before handling orders. This is a safety requirement for customers.' 
            });
        }

        // Attach partner profile
        if (!order.deliveryPartner || order.deliveryPartner.partnerId?.toString() !== deliveryBoy._id.toString()) {
            order.deliveryPartner = {
                partnerId: deliveryBoy._id,
                name: deliveryBoy.name,
                photoUrl: deliveryBoy.photoUrl,
                rating: deliveryBoy.rating || 4.5,
                totalDeliveries: deliveryBoy.totalDeliveries || 0,
                idVerified: deliveryBoy.idVerified || false,
                bgChecked: deliveryBoy.bgChecked || false,
                vehicleType: deliveryBoy.vehicleType || 'Bicycle',
                plate: deliveryBoy.plate || 'N/A',
                proxyPhone: '+910000000000',
            };
        }

        // Handle Chat Room Lifecycle
        if (status === 'delivering' || status === 'preparing') {
            try {
                await createChatRoom(order._id, order.user || order.customer.phone, deliveryBoy._id);
            } catch (err) {
                console.error('Failed to create/check chat room:', err.message);
            }
        }

        if (status === 'delivered' || status === 'cancelled') {
            try {
                await closeChatRoom(order._id);
            } catch (err) {
                console.error('Failed to close chat room:', err.message);
            }
            // Automatically return to ACTIVE status when delivered/cancelled
            await setDriverStatus(deliveryBoy._id, 'ACTIVE', deliveryBoy.assignedArea);
            
            if (status === 'delivered') {
                deliveryBoy.totalDeliveries += 1;
                await deliveryBoy.save();
            }
        }

        order.status = status;
        await order.save();

        const updatedDriver = await DeliveryBoy.findById(deliveryBoy._id);
        res.json({ success: true, order, workStatus: updatedDriver.workStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update work status
// @route   PUT /api/delivery/status
// @access  Private / Delivery
exports.updateWorkStatus = async (req, res) => {
    try {
        const { workStatus } = req.body;
        const validStatuses = ['ACTIVE', 'BUSY', 'GOING_FOR_DROP', 'OFFLINE'];
        if (!validStatuses.includes(workStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);
        if (!deliveryBoy) return res.status(404).json({ success: false, message: 'Delivery boy not found' });

        await setDriverStatus(deliveryBoy._id, workStatus, deliveryBoy.assignedArea);

        res.json({ success: true, workStatus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// @desc    Update delivery boy profile
// @route   PUT /api/delivery/profile
// @access  Private / Delivery
exports.updateDeliveryProfile = async (req, res) => {
    try {
        const { name, phone, vehicleType, plate } = req.body;
        const deliveryBoy = await DeliveryBoy.findById(req.deliveryBoy._id);

        if (!deliveryBoy) {
            return res.status(404).json({ success: false, message: 'Delivery boy not found' });
        }

        if (name) deliveryBoy.name = name;
        if (phone) deliveryBoy.phone = phone;
        if (vehicleType) deliveryBoy.vehicleType = vehicleType;
        if (plate) deliveryBoy.plate = plate;

        if (req.file) {
            deliveryBoy.photoUrl = req.file.path; // Cloudinary URL
        }

        await deliveryBoy.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            deliveryBoy: {
                id: deliveryBoy._id,
                name: deliveryBoy.name,
                email: deliveryBoy.email,
                photoUrl: deliveryBoy.photoUrl,
                phone: deliveryBoy.phone
            }
        });
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
