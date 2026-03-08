const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    orderQrCode: {
        type: String,
        default: '/upi_qr.png'
    },
    cancelQrCode: {
        type: String,
        default: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=payUPI://example&color=E53935&bgcolor=f9fafb'
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
