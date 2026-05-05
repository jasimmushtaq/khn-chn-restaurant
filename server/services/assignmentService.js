const { assignOrderToDriver } = require('./orderAssignment');

const assignDeliveryBoy = async (order, area) => {
    // We defer to the real-time assignment service
    // We don't return partnerData anymore because it's handled via Socket.io
    // and the status update will happen when the driver accepts.
    const { io } = require('../chat');
    if (io) {
        assignOrderToDriver(order._id, io);
    } else {
        console.warn('Socket.io (io) not initialized. Cannot assign order in real-time.');
    }
    return null;
};

module.exports = { assignDeliveryBoy };
