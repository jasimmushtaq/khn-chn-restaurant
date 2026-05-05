const Order = require('../models/Order');
const DeliveryBoy = require('../models/DeliveryBoy');
const User = require('../models/User');
const mongoose = require('mongoose');
const { createChatRoom, closeChatRoom } = require('../services/chatRoom');
const { assignDeliveryBoy } = require('../services/assignmentService');

const createOrder = async (req, res) => {
    try {
        const { customer, items, totalAmount, transactionId, notes, userId, area } = req.body;
        if (!customer?.name || !customer?.phone || !customer?.address) {
            return res.status(400).json({ success: false, message: 'Customer details are required' });
        }
        if (!transactionId || !transactionId.trim()) {
            return res.status(400).json({ success: false, message: 'Transaction ID is required' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order must have at least one item' });
        }

        if (transactionId !== 'CASH ON DELIVERY') {
            const existingTx = await Order.findOne({
                $or: [
                    { transactionId },
                    { cancelTransactionId: transactionId }
                ]
            });
            if (existingTx) {
                return res.status(400).json({ success: false, message: 'Transaction ID must be unique. This ID has already been used.' });
            }
        }

        const orderData = {
            user: userId || null,
            customer,
            items,
            totalAmount,
            transactionId,
            notes,
            area: area || 'General',
            paymentMethod: transactionId === 'CASH ON DELIVERY' ? 'COD' : 'Online',
            paymentStatus: transactionId === 'CASH ON DELIVERY' ? 'pending' : 'paid'
        };

        const order = await Order.create(orderData);

        // Automatic Assignment
        if (area) {
            const partnerData = await assignDeliveryBoy(order, area);
            if (partnerData) {
                order.deliveryPartner = partnerData;
                await order.save();
            }
        }

        res.status(201).json({ success: true, message: 'Order placed successfully!', order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        let id = req.params.id.trim().replace(/^#/, '');
        
        // Basic protection against RegEx injection by escaping special characters if we search by non-hex
        const safeId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        let order;

        if (mongoose.Types.ObjectId.isValid(id)) {
            order = await Order.findById(id);
        }

        if (!order) {
            // Find by matching the end of the ObjectId string
            order = await Order.findOne({
                $expr: {
                    $regexMatch: {
                        input: { $toString: "$_id" },
                        regex: safeId + '$',
                        options: 'i'
                    }
                }
            }).sort({ createdAt: -1 });
        }

        if (!order) {
            // Also try searching by phone number or email as a fallback for new customers who might enter their details instead
            const regexSearch = new RegExp(safeId, 'i');
            
            const matchingUsers = await User.find({
                $or: [
                    { email: regexSearch },
                    { phone: regexSearch }
                ]
            }).select('_id');
            const userIds = matchingUsers.map(u => u._id);

            order = await Order.findOne({
                $or: [
                    { 'customer.phone': regexSearch },
                    { 'customer.email': regexSearch },
                    { user: { $in: userIds } }
                ]
            }).sort({ createdAt: -1 });
        }

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status, deliveryBoyId } = req.body;
        const validStatuses = ['received', 'preparing', 'delivering', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        let order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // If assigning a delivery boy (explicitly or via status update)
        if (deliveryBoyId) {
            const boy = await DeliveryBoy.findById(deliveryBoyId);
            if (boy) {
                order.deliveryPartner = {
                    partnerId: boy._id,
                    name: boy.name,
                    photoUrl: boy.photoUrl,
                    rating: boy.rating || 4.5,
                    totalDeliveries: boy.totalDeliveries || 0,
                    idVerified: boy.idVerified || false,
                    bgChecked: boy.bgChecked || false,
                    vehicleType: boy.vehicleType || 'Not set',
                    plate: boy.plate || 'Not set',
                    proxyPhone: '+910000000000',
                };

                // Create or ensure chat room
                if (status === 'delivering' || status === 'preparing') {
                    try {
                        await createChatRoom(order._id, order.user || order.customer.phone, boy._id);
                    } catch (e) {
                        console.warn('Chat room check/creation failed:', e.message);
                    }
                }
            }
        } else if (status === 'delivering' && !order.deliveryPartner) {
             // If going out for delivery but no partner assigned, and we can find one? 
             // Normally admin or driver assigns themselves. 
        }

        if (status === 'delivered' || status === 'cancelled') {
            try {
                if (status === 'delivered') {
                    await closeChatRoom(order._id);
                }
                
                // Free the delivery boy
                if (order.deliveryPartner && order.deliveryPartner.partnerId) {
                    await DeliveryBoy.findByIdAndUpdate(order.deliveryPartner.partnerId, { isBusy: false });
                }
            } catch (e) {
                console.warn('Post-status update maintenance skipped:', e.message);
            }
        }

        order.status = status;
        await order.save();

        res.json({ success: true, message: 'Status updated', order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.status === 'delivered') return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });

        order.status = 'cancelled';
        await order.save();

        // Free the delivery boy
        if (order.deliveryPartner && order.deliveryPartner.partnerId) {
            await DeliveryBoy.findByIdAndUpdate(order.deliveryPartner.partnerId, { isBusy: false });
        }

        res.json({ success: true, message: 'Order cancelled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const adminCancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason || !reason.trim()) {
            return res.status(400).json({ success: false, message: 'Cancellation reason is required' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.status === 'delivered') {
            return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
        }

        order.status = 'cancelled';
        order.cancellationReason = reason;
        await order.save();

        // Free the delivery boy
        if (order.deliveryPartner && order.deliveryPartner.partnerId) {
            await DeliveryBoy.findByIdAndUpdate(order.deliveryPartner.partnerId, { isBusy: false });
        }

        res.json({ success: true, message: 'Order cancelled by admin', order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, cancelOrder, adminCancelOrder };
