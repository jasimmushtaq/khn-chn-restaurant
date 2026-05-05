const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const OrderSchema = new mongoose.Schema({
    customer: {
        name: String,
        phone: String,
        email: String
    }
}, { strict: false });

const Order = mongoose.model('Order', OrderSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const order = await Order.findById('69baad88dc5d91ed636afabd');
        console.log('Order found by strictly matching ID:', !!order);
        if (order) console.log(order);

        const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
        console.log('Recent 5 orders IDs:');
        orders.forEach(o => console.log(o._id.toString()));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
run();
