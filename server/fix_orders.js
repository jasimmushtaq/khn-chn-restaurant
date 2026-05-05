const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Order.updateMany(
        { "deliveryPartner.name": { $exists: false } },
        { $unset: { deliveryPartner: 1 } }
    );
    console.log(`Updated ${result.modifiedCount} orders.`);
    process.exit(0);
}
fix();
