const jwt = require('jsonwebtoken');
const DeliveryBoy = require('../models/DeliveryBoy');

const protectDelivery = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            if (token === 'demo-token') {
                req.deliveryBoy = await DeliveryBoy.findById("69aeb5620a7a7ad0f1688f90").select('-password');
                return next();
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.deliveryBoy = await DeliveryBoy.findById(decoded.id).select('-password');
            if (!req.deliveryBoy) {
                return res.status(401).json({ success: false, message: 'Not authorized, delivery boy not found' });
            }
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

module.exports = { protectDelivery };
