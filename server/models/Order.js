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
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    cancelTransactionId: { type: String },
    status: {
        type: String,
        enum: ['received', 'preparing', 'delivering', 'delivered', 'cancelled'],
        default: 'received',
    },
    notes: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
