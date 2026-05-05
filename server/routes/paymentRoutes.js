const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const { createStripePaymentIntent, confirmStripeOrder } = require('../controllers/stripeController');

// Razorpay
router.post('/create-order', createRazorpayOrder);
router.post('/verify-payment', verifyPayment);

// Stripe
router.post('/stripe/create-intent', createStripePaymentIntent);
router.post('/stripe/confirm', confirmStripeOrder);

module.exports = router;
