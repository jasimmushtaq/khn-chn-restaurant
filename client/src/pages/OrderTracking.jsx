import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, ChefHat, Truck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getOrderById, cancelOrder, getSettings } from '../services/api';
import toast from 'react-hot-toast';

const OrderTracking = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelTransactionId, setCancelTransactionId] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=payUPI://example&color=E53935&bgcolor=f9fafb');

    useEffect(() => {
        if (orderId) fetchOrderDetails();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await getSettings();
            if (data.settings && data.settings.cancelQrCode) {
                setQrCodeUrl(data.settings.cancelQrCode.startsWith('/uploads') ? `http://localhost:5000${data.settings.cancelQrCode}` : data.settings.cancelQrCode);
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
        }
    };

    const fetchOrderDetails = async () => {
        if (!orderId) return;
        setLoading(true);
        setSearchParams({ orderId });
        try {
            const { data } = await getOrderById(orderId);
            setOrder(data.order);
            toast.success('Order tracked successfully!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Order not found');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelTransactionId.trim()) {
            return toast.error('Please enter the cancellation transaction ID');
        }
        if (cancelTransactionId.trim() === order.transactionId) {
            return toast.error('Cancellation transaction ID cannot be the same as the order transaction ID');
        }
        setCancelling(true);
        try {
            // Fake payment of 5 rupees
            await new Promise(resolve => setTimeout(resolve, 1500));
            await cancelOrder(order._id, cancelTransactionId);
            toast.success('Fine of ₹5 paid. Order cancelled successfully.');
            setShowCancelModal(false);
            setCancelTransactionId('');
            fetchOrderDetails();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    const steps = [
        { id: 'received', label: 'Order Received', icon: Clock },
        { id: 'preparing', label: 'Preparing', icon: ChefHat },
        { id: 'delivering', label: 'Out for Delivery', icon: Truck },
        { id: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const getStepIndex = (status) => steps.findIndex(s => s.id === status);
    const currentStep = order ? getStepIndex(order.status) : -1;
    const isCancelled = order?.status === 'cancelled';

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-32">
            <div className="max-w-3xl mx-auto px-5">

                {/* Header */}
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 font-semibold hover:text-[#E53935] transition-colors mb-6 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Track Order</h1>
                </div>

                {/* Tracker Input */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 mb-8 shadow-sm">
                    <label className="block text-gray-700 font-bold mb-3">Enter your 24-character Order ID</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="e.g. 64b1f..."
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E53935] transition-all font-medium tracking-wide"
                        />
                        <button
                            onClick={fetchOrderDetails}
                            disabled={loading || !orderId}
                            className="px-8 py-4 bg-[#E53935] text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(229,57,53,0.25)] hover:shadow-[0_12px_24px_rgba(229,57,53,0.35)] hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            {loading ? 'Tracking...' : 'Track Now'}
                        </button>
                    </div>
                </div>

                {/* Live Output */}
                {order && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 bounce-animation">

                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-10 pb-6 border-b border-gray-100 gap-4">
                            <div>
                                <p className="text-gray-500 font-medium mb-1">Order #<span className="text-gray-900 font-bold">{order._id.slice(-8).toUpperCase()}</span></p>
                                <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-500 font-medium mb-1">Total</p>
                                <p className="text-[#E53935] text-2xl font-black">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Stepper logic */}
                        {!isCancelled ? (
                            <div className="relative">
                                <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-gray-100 -z-10 hidden sm:block"></div>

                                <div className="grid grid-cols-1 sm:grid-cols-1 gap-8 relative z-10">
                                    {steps.map((step, idx) => {
                                        const isCompleted = idx <= currentStep;
                                        const isActive = idx === currentStep;

                                        return (
                                            <div key={step.id} className="flex gap-6 items-start">
                                                {/* Icon bubble */}
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-[3px] transition-colors shadow-sm ${isCompleted
                                                    ? 'bg-[#E53935] border-white text-white'
                                                    : 'bg-white border-gray-200 text-gray-300'
                                                    } ${isActive ? 'ring-4 ring-red-100' : ''}`}>
                                                    {isCompleted && !isActive ? <CheckCircle2 size={24} /> : <step.icon size={26} />}
                                                </div>

                                                {/* Content */}
                                                <div className="pt-2.5 flex-1 border-b border-dashed border-gray-200 pb-6 last:border-0 last:pb-0">
                                                    <h3 className={`text-lg font-bold ${isActive ? 'text-[#E53935]' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                                                        }`}>
                                                        {step.label}
                                                    </h3>
                                                    {isActive && (
                                                        <p className="text-gray-500 mt-1 font-medium text-sm">
                                                            {step.id === 'received' && 'We have received your order details.'}
                                                            {step.id === 'preparing' && 'The chef is cooking your delicious meal.'}
                                                            {step.id === 'delivering' && 'The delivery partner is on the way.'}
                                                            {step.id === 'delivered' && 'Enjoy your food!'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 mb-10 bg-red-50 border border-red-200 rounded-3xl p-8 text-center animate-fade-in">
                                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                                <h3 className="text-2xl font-black text-red-600 mb-2 uppercase tracking-tight">Order Cancelled</h3>

                                <div className="max-w-md mx-auto">
                                    {order.cancellationReason ? (
                                        <div className="mb-4">
                                            <p className="text-xs font-black text-red-400 uppercase tracking-[0.2em] mb-2">Reason provided by restaurant</p>
                                            <div className="bg-white border border-red-100 p-4 rounded-2xl text-red-800 font-bold italic shadow-sm">
                                                "{order.cancellationReason}"
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-red-500 font-bold text-lg mb-4">
                                            Your order has been cancelled successfully.
                                        </p>
                                    )}

                                    {order.transactionId !== 'CASH ON DELIVERY' && (
                                        <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center gap-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            <p className="text-sm font-black text-green-700 uppercase tracking-widest leading-tight">
                                                Refund will be paid shortly within 30 mins
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Items Info */}
                        <div className="mt-10 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-4">Order Summary</h4>
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center mb-2 last:mb-0">
                                    <span className="text-gray-600 font-medium">
                                        <span className="text-gray-400 mr-2">{item.qty}x</span>
                                        {item.name}
                                    </span>
                                    <span className="text-gray-900 font-bold">₹{(item.qty * item.price).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Cancel Action */}
                        {!isCancelled && order.status !== 'delivered' && (
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="px-6 py-3 font-bold text-[#E53935] border border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <XCircle size={18} /> Cancel Order
                                </button>
                            </div>
                        )}

                        {/* Modal for ₹5 Fine Payment */}
                        {showCancelModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
                                <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl">
                                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
                                        <AlertCircle size={28} className="text-[#E53935]" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Cancel Order?</h3>
                                    <p className="text-gray-500 font-medium mb-4">
                                        You are about to cancel your order. A cancellation fine of <strong className="text-gray-900">₹5</strong> must be paid directly to proceed.
                                    </p>

                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 flex flex-col items-center">
                                        <p className="text-sm font-bold text-gray-700 mb-2">Scan & Pay ₹5</p>
                                        <img src={qrCodeUrl} alt="Pay 5 Rupees QR" className="w-32 h-32 rounded-lg mix-blend-multiply object-contain" />
                                    </div>

                                    <div className="mb-6 text-left">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Cancellation Transaction ID</label>
                                        <input
                                            type="text"
                                            value={cancelTransactionId}
                                            onChange={(e) => setCancelTransactionId(e.target.value)}
                                            placeholder="Enter 12-digit transaction ID"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E53935] transition-all font-medium"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowCancelModal(false)}
                                            disabled={cancelling}
                                            className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                                        >
                                            Keep Order
                                        </button>
                                        <button
                                            onClick={handleCancelOrder}
                                            disabled={cancelling}
                                            className="flex-1 py-3.5 bg-[#E53935] text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                                        >
                                            {cancelling ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                    Paying...
                                                </>
                                            ) : (
                                                'Pay ₹5 & Cancel'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;
