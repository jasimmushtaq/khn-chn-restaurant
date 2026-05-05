const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    dishId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    image: { type: String },
    category: { type: String },
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    cancelTransactionId: { type: String },
    area: { type: String, default: 'General' },
    status: {
        type: String,
        enum: ['received', 'preparing', 'delivering', 'delivered', 'cancelled'],
        default: 'received',
    },
    notes: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    paymentMethod: { type: String, enum: ['COD', 'Online'], default: 'Online' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    deliveryPartner: {
        partnerId: { type: String },
        name: { type: String },
        photoUrl: { type: String },
        rating: { type: Number },
        totalDeliveries: { type: Number },
        idVerified: { type: Boolean, default: false },
        bgChecked: { type: Boolean, default: false },
        vehicleType: { type: String },
        plate: { type: String },
        proxyPhone: { type: String },
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
