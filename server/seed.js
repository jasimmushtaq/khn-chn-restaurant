const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        const Admin = require('./models/Admin');

        const existing = await Admin.findOne({ email: 'admin@saveur.com' });

        if (existing) {
            // Ensure existing main admin is approved and marked as main
            if (!existing.isApproved || !existing.isMainAdmin) {
                existing.isApproved = true;
                existing.isMainAdmin = true;
                await existing.save();
                console.log('✅ Existing main admin updated with approval status.');
            } else {
                console.log('✅ Default admin already exists and is approved — skipping seed.');
            }
            return;
        }

        // Hash password manually (safe across all Mongoose versions)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Use insertOne via the model to skip pre-save double-hashing
        const admin = new Admin({
            email: 'admin@saveur.com',
            password: hashedPassword,
            isApproved: true,
            isMainAdmin: true
        });
        admin.$locals.skipHash = true; // flag to skip pre-save hash
        await admin.save();

        console.log('🌱 ─────────────────────────────────────');
        console.log('🌱  Default admin account created!');
        console.log('🌱  📧 Email   : admin@saveur.com');
        console.log('🌱  🔑 Password: admin123');
        console.log('🌱 ─────────────────────────────────────');
        // Seed Delivery Boy
        const DeliveryBoy = require('./models/DeliveryBoy');
        const existingBoy = await DeliveryBoy.findOne({ email: 'delivery@saveur.com' });
        if (!existingBoy) {
            const boySalt = await bcrypt.genSalt(10);
            const boyHashed = await bcrypt.hash('delivery123', boySalt);
            const deliveryBoy = new DeliveryBoy({ email: 'delivery@saveur.com', password: boyHashed, name: 'Delivery Boy', phone: '1234567890' });
            deliveryBoy.$locals.skipHash = true;
            await deliveryBoy.save();
            console.log('🌱 Delivery boy account created! Email: delivery@saveur.com Password: delivery123');
        } else {
            console.log('✅ Delivery boy already exists — skipping seed.');
        }
    } catch (err) {
        console.error('❌ Seeder error:', err.message);
    }
};

module.exports = seedAdmin;
