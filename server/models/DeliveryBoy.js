const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const deliveryBoySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    isRegisteredByAdmin: {
        type: Boolean,
        default: false,
    },
    photoUrl: { type: String },
    rating: { type: Number, default: 4.5 },
    totalDeliveries: { type: Number, default: 0 },
    idVerified: { type: Boolean, default: false },
    bgChecked: { type: Boolean, default: false },
    vehicleType: { type: String },
    plate: { type: String },
    assignedArea: { type: String, default: 'General' },
    workStatus: {
        type: String,
        enum: ['ACTIVE', 'BUSY', 'GOING_FOR_DROP', 'OFFLINE'],
        default: 'OFFLINE'
    },
    currentOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    lastStatusUpdate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Hash password before saving
deliveryBoySchema.pre('save', async function () {
    if (this.$locals.skipHash || !this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
deliveryBoySchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema);
