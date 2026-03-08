const Order = require('../models/Order');

const createOrder = async (req, res) => {
    try {
        const { customer, items, totalAmount, transactionId, notes } = req.body;
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

        const order = await Order.create({ customer, items, totalAmount, transactionId, notes });
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
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['received', 'preparing', 'delivering', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
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
        const { cancelTransactionId } = req.body;

        if (!cancelTransactionId || !cancelTransactionId.trim()) {
            return res.status(400).json({ success: false, message: 'Cancellation transaction ID is required' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.status === 'delivered') return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });

        if (order.transactionId === cancelTransactionId) {
            return res.status(400).json({ success: false, message: 'Cancellation transaction ID cannot be the same as the ordering transaction ID' });
        }

        const existingTx = await Order.findOne({
            $or: [
                { transactionId: cancelTransactionId },
                { cancelTransactionId }
            ]
        });
        if (existingTx) {
            return res.status(400).json({ success: false, message: 'This transaction ID has already been used. Transaction IDs must be unique.' });
        }

        order.status = 'cancelled';
        order.cancelTransactionId = cancelTransactionId;
        await order.save();

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

        res.json({ success: true, message: 'Order cancelled by admin', order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, cancelOrder, adminCancelOrder };
