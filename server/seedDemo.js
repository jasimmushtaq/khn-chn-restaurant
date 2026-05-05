const mongoose = require('mongoose');
const DeliveryBoy = require('./models/DeliveryBoy');
require('dotenv').config();

const seedDemoDelivery = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected for seeding');

        const demoId = "69aeb5620a7a7ad0f1688f90";
        const existing = await DeliveryBoy.findById(demoId);

        if (!existing) {
            await DeliveryBoy.create({
                _id: demoId,
                name: "Demo Delivery Partner",
                email: "demo@delivery.com",
                phone: "0000000000",
                password: "hashed_password_not_needed_for_bypass",
                isApproved: true,
                workStatus: 'OFFLINE'
            });
            console.log('✅ Demo delivery partner created');
        } else {
            console.log('ℹ️ Demo delivery partner already exists');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDemoDelivery();
