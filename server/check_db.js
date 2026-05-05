const mongoose = require('mongoose');
const Order = require('./models/Order');
const DeliveryBoy = require('./models/DeliveryBoy');
require('dotenv').config();

async function checkOrders() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant');
        console.log('Connected to MongoDB');
        
        const orders = await Order.find({ status: { $ne: 'delivered' } }).limit(5);
        if (orders.length === 0) {
            console.log('No active orders found.');
        } else {
            orders.forEach(o => {
                console.log(`Order ID: ${o._id}`);
                console.log(`Status: ${o.status}`);
                console.log(`Partner Attached: ${o.deliveryPartner ? 'Yes (' + o.deliveryPartner.name + ')' : 'No'}`);
                console.log('-------------------');
            });
        }
        
        const boys = await DeliveryBoy.find().limit(5);
        console.log('\nAvailable Delivery Boys:');
        boys.forEach(b => {
            console.log(`Boy ID: ${b._id}, Name: ${b.name}, Approved: ${b.isApproved}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

checkOrders();
