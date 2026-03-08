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
