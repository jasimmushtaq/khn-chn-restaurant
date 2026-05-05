import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    PaymentElement,
    Elements,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { CheckCircle, CreditCard } from 'lucide-react';

const CheckoutForm = ({ clientSecret, amount, onPaymentSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (clientSecret.startsWith('pi_demo_')) {
            setLoading(true);
            toast.loading('Simulating Card Transaction...', { duration: 1500 });
            setTimeout(() => {
                onPaymentSuccess('pi_demo_' + Date.now());
            }, 1500);
            return;
        }

        if (!stripe || !elements) return;

        setLoading(true);
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (error) {
            toast.error(error.message);
            setLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onPaymentSuccess(paymentIntent.id);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                >
                    Cancel
                </button>
                <button
                    disabled={!stripe || loading}
                    className="flex-1 py-4 bg-[#E53935] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-[#C62828] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <CheckCircle size={20} />
                            Pay ₹{amount.toFixed(2)}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

const StripePayment = ({ clientSecret, publishableKey, amount, onPaymentSuccess, onCancel }) => {
    const stripePromise = loadStripe(publishableKey);

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl max-w-md w-full mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-100 text-[#E53935] rounded-2xl">
                    <CreditCard size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900">Card Payment</h2>
                    <p className="text-sm text-gray-500 font-medium">Secure checkout via Stripe</p>
                </div>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <CheckoutForm clientSecret={clientSecret} amount={amount} onPaymentSuccess={onPaymentSuccess} onCancel={onCancel} />
            </Elements>

            <p className="mt-6 text-center text-xs text-gray-400 font-medium italic">
                Your payment is encrypted and processed securely.
            </p>
        </div>
    );
};

export default StripePayment;
