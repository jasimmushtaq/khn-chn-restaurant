const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { assignDeliveryBoy } = require('../services/assignmentService');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Public
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        console.log(`[PAYMENT] Initiate attempt for amount: ${amount}`);

        if (amount === undefined || amount === null || isNaN(amount)) {
            return res.status(400).json({ success: false, message: 'Valid amount is required' });
        }

        // --- Robust Demo/Placeholder Bypass ---
        const keyId = process.env.RAZORPAY_KEY_ID || '';
        const isDemo = !keyId || 
                      !keyId.startsWith('rzp_') || 
                      keyId === 'your_razorpay_key_id' || 
                      keyId.includes('placeholder');

        if (isDemo) {
            console.log('--- [DEMO MODE] Bypassing Razorpay (Keys not configured) ---');
            return res.status(200).json({
                success: true,
                order_id: `order_DEMO_${Date.now()}`,
                amount: Math.round(Number(amount) * 100),
                key_id: "rzp_test_placeholder_key",
                demo: true
            });
        }

        console.log('[PAYMENT] Creating REAL Razorpay Order...');
        const options = {
            amount: Math.round(Number(amount) * 100), // amount in smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
        }

        res.status(200).json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Payment and Create Restaurant Order
// @route   POST /api/payment/verify-payment
// @access  Public
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            customer,
            items,
            totalAmount,
            notes,
            userId,
            area
        } = req.body;

        // --- Demo Bypass ---
        const isDemo = razorpay_order_id && razorpay_order_id.startsWith('order_DEMO_');
        
        if (!isDemo) {
            // Verify Signature
            const sign = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSign = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(sign.toString())
                .digest("hex");

            if (razorpay_signature !== expectedSign) {
                return res.status(400).json({ success: false, message: 'Invalid payment signature' });
            }
        }

        // Create the actual order in our database
        const order = await Order.create({
            user: userId || null,
            customer,
            items,
            totalAmount,
            transactionId: razorpay_payment_id,
            notes,
            area: area || 'General',
            paymentMethod: 'Online',
            paymentStatus: 'paid'
        });

        // Automatic Assignment
        if (area) {
            const partnerData = await assignDeliveryBoy(order, area);
            if (partnerData) {
                order.deliveryPartner = partnerData;
                await order.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified and order placed successfully!',
            order
        });
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
