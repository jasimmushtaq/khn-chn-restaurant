const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = require('stripe')(stripeSecretKey);
const Order = require('../models/Order');
const { assignDeliveryBoy } = require('../services/assignmentService');

// @desc    Create Stripe Payment Intent
// @route   POST /api/payment/stripe/create-intent
// @access  Public
exports.createStripePaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'inr' } = req.body;
        console.log(`[STRIPE] Initiate attempt for amount: ${amount}`);

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ success: false, message: 'Valid amount is required' });
        }

        // --- Demo Mode Handling ---
        const stripeKey = process.env.STRIPE_SECRET_KEY || '';
        const isDemo = !stripeKey || stripeKey.includes('placeholder') || stripeKey === 'your_stripe_secret_key';

        if (isDemo) {
            console.log('--- [STRIPE DEMO MODE] Bypassing real Stripe ---');
            return res.status(200).json({
                success: true,
                clientSecret: 'pi_demo_secret_' + Date.now(),
                publishableKey: 'pk_test_placeholder',
                demo: true
            });
        }

        // Stripe expects amount in cents/paise
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(amount) * 100),
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        });
    } catch (error) {
        console.error('Stripe Intent Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Confirm Stripe Order
// @route   POST /api/payment/stripe/confirm
// @access  Public
exports.confirmStripeOrder = async (req, res) => {
    try {
        const {
            paymentIntentId,
            customer,
            items,
            totalAmount,
            notes,
            userId,
            area
        } = req.body;

        // Verify with Stripe
        let status = 'succeeded';
        if (!paymentIntentId.startsWith('pi_demo_')) {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            status = paymentIntent.status;
        }

        if (status !== 'succeeded') {
            return res.status(400).json({ success: false, message: 'Payment not successful' });
        }

        // Ensure transactionId/paymentIntentId is unique
        const existingOrder = await Order.findOne({ transactionId: paymentIntentId });
        if (existingOrder) {
            return res.status(200).json({
                success: true,
                message: 'Stripe payment already confirmed.',
                order: existingOrder
            });
        }

        // Create the actual order in our database
        const order = await Order.create({
            user: (userId && userId.length === 24) ? userId : null, // Ensure valid MongoDB ObjectId
            customer,
            items,
            totalAmount,
            transactionId: paymentIntentId,
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
            message: 'Stripe payment confirmed and order placed!',
            order
        });
    } catch (error) {
        console.error('Stripe Confirmation Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
