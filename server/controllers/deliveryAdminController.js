const DeliveryBoy = require('../models/DeliveryBoy');

// @desc    Get all delivery boys (admin view)
// @route   GET /api/admin/deliveryboys
// @access  Private (admin)
exports.getAllDeliveryBoys = async (req, res) => {
    try {
        const boys = await DeliveryBoy.find().select('-password');
        res.json({ success: true, count: boys.length, boys });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update delivery boy email/password
// @route   PUT /api/admin/deliveryboys/:id
// @access  Private (admin)
exports.updateDeliveryBoy = async (req, res) => {
    try {
        const { 
            email, password, name, phone, isApproved, 
            photoUrl, rating, totalDeliveries, idVerified, bgChecked, 
            vehicleType, plate, assignedArea 
        } = req.body;
        const update = {};
        if (email) update.email = email;
        if (name) update.name = name;
        if (phone) update.phone = phone;
        if (assignedArea) update.assignedArea = assignedArea;
        if (typeof isApproved !== 'undefined') update.isApproved = isApproved;
        if (photoUrl) update.photoUrl = photoUrl;
        if (typeof rating !== 'undefined') update.rating = rating;
        if (typeof totalDeliveries !== 'undefined') update.totalDeliveries = totalDeliveries;
        if (typeof idVerified !== 'undefined') update.idVerified = idVerified;
        if (typeof bgChecked !== 'undefined') update.bgChecked = bgChecked;
        if (vehicleType) update.vehicleType = vehicleType;
        if (plate) update.plate = plate;

        if (password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash(password, salt);
        }
        const boy = await DeliveryBoy.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-password');
        if (!boy) return res.status(404).json({ success: false, message: 'Delivery boy not found' });
        res.json({ success: true, boy });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete delivery boy
// @route   DELETE /api/admin/deliveryboys/:id
// @access  Private (admin)
exports.deleteDeliveryBoy = async (req, res) => {
    try {
        const boy = await DeliveryBoy.findByIdAndDelete(req.params.id);
        if (!boy) return res.status(404).json({ success: false, message: 'Delivery boy not found' });
        res.json({ success: true, message: 'Delivery boy removed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
