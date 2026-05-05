const { getActiveDriversInArea, setDriverStatus } = require('./deliveryService');
const Order = require('../models/Order');
const DeliveryBoy = require('../models/DeliveryBoy');
const eventBus = require('./eventBus');

// Queue for pending orders when no drivers are available
const pendingOrderQueue = [];

const assignOrderToDriver = async (orderId, io) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) return;

        const area = order.area || 'General';
        const activeDriverIds = await getActiveDriversInArea(area);

        if (activeDriverIds.length === 0) {
            console.log(`No active drivers in ${area}. Adding order ${orderId} to pending queue.`);
            pendingOrderQueue.push({ orderId, area });
            return;
        }

        // Fetch driver details to sort or filter (e.g., by last delivery time or rating)
        const drivers = await DeliveryBoy.find({ _id: { $in: activeDriverIds } })
            .sort({ lastStatusUpdate: 1 }); // Oldest update first (longest active)

        for (const driver of drivers) {
            // Send order notification via Socket.io
            const assigned = await attemptAssignment(order, driver, io);
            if (assigned) {
                console.log(`Order ${orderId} assigned to driver ${driver.name}`);
                return;
            }
        }

        // if we are here, all active drivers rejected or timed out
        console.log(`All active drivers in ${area} unavailable. Re-adding to queue.`);
        pendingOrderQueue.push({ orderId, area });
    } catch (error) {
        console.error('Order assignment error:', error);
    }
};

const attemptAssignment = (order, driver, io) => {
    return new Promise((resolve) => {
        console.log(`Attempting to assign order ${order._id} to ${driver.name}`);
        
        // Listener for acceptance
        const onAccepted = (data) => {
            if (data.orderId.toString() === order._id.toString() && data.driverId.toString() === driver._id.toString()) {
                clearTimeout(timeout);
                eventBus.removeListener('order_accepted', onAccepted);
                resolve(true);
            }
        };

        eventBus.on('order_accepted', onAccepted);

        // Emit to driver's personal room
        io.to(`driver:${driver._id}`).emit('new_order_request', {
            orderId: order._id,
            totalAmount: order.totalAmount,
            customerName: order.customer?.name || 'Customer',
            address: order.customer?.address || 'Address',
            timeout: 30
        });

        const timeout = setTimeout(() => {
            console.log(`Assignment for ${driver.name} timed out.`);
            eventBus.removeListener('order_accepted', onAccepted);
            io.to(`driver:${driver._id}`).emit('order_request_timeout', { orderId: order._id });
            resolve(false);
        }, 30000);
    });
};

// This needs to be integrated with the main Socket.io instance
const checkPendingQueue = async (driverId, area, io) => {
    const orderIndex = pendingOrderQueue.findIndex(item => item.area === area);
    if (orderIndex !== -1) {
        const { orderId } = pendingOrderQueue[orderIndex];
        pendingOrderQueue.splice(orderIndex, 1);
        assignOrderToDriver(orderId, io);
    }
};

module.exports = {
    assignOrderToDriver,
    checkPendingQueue,
    pendingOrderQueue
};
