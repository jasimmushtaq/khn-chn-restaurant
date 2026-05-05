const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function show() {
    await mongoose.connect(process.env.MONGO_URI);
    const orders = await Order.find({ status: { $ne: 'delivered' } }).sort({ createdAt: -1 }).limit(10);
    console.log(JSON.stringify(orders.map(o => ({
        id: o._id,
        status: o.status,
        partner: o.deliveryPartner ? { name: o.partnerName, id: o.deliveryPartner.partnerId } : 'NONE'
    })), null, 2));
    process.exit(0);
}
show();
