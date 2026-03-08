import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CheckCircle, CreditCard, User, MapPin, Phone, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder, getSettings } from '../services/api';
import toast from 'react-hot-toast';

const OrdersPage = () => {
    const { cartItems, removeFromCart, updateQty, clearCart, totalItems, totalPrice } = useCart();
    const [placing, setPlacing] = useState(false);
    const [placedStatus, setPlacedStatus] = useState(null);
    const [placedMode, setPlacedMode] = useState(null);

    const [form, setForm] = useState({ name: '', phone: '', address: '', transactionId: '', notes: '' });
    const navigate = useNavigate();
    const [qrCodeUrl, setQrCodeUrl] = useState('/upi_qr.png');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await getSettings();
                if (data.settings && data.settings.orderQrCode) {
                    setQrCodeUrl(data.settings.orderQrCode.startsWith('/uploads') ? `http://localhost:5000${data.settings.orderQrCode}` : data.settings.orderQrCode);
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();
    }, []);

    const handlePlaceOrder = async (e, method = 'UPI') => {
        e.preventDefault();
        if (!form.name || !form.phone || !form.address) {
            toast.error('Please fill in Name, Phone, and Address');
            return;
        }
        if (method === 'UPI' && !form.transactionId) {
            toast.error('Transaction ID is required for UPI Payment');
            return;
        }

        setPlacing(true);
        try {
            const payload = {
                customer: {
                    name: form.name,
                    phone: form.phone,
                    address: form.address,
                },
                items: cartItems.map(item => ({
                    dishId: item._id,
                    name: item.name,
                    price: item.price,
                    qty: item.qty,
                    image: item.image,
                    category: item.category
                })),
                totalAmount: totalPrice,
                transactionId: method === 'COD' ? 'CASH ON DELIVERY' : form.transactionId,
                notes: form.notes
            };

            const res = await createOrder(payload);

            setPlacedStatus(res.data.order._id);
            setPlacedMode(method);
            clearCart();
            toast.success('🎉 Order placed successfully!');

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacing(false);
        }
    };

    if (placedStatus) {
        return (
            <div className="min-h-screen pt-24 pb-32 flex items-center justify-center px-5 bg-[#f8f9fa]">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                        Order Confirmed!
                    </h1>
                    <p className="text-gray-500 mb-8 font-medium">Thank you, {form.name}!</p>

                    <div className="bg-gray-50 rounded-2xl p-5 text-left mb-8 space-y-3">
                        <div className="flex justify-between border-b border-gray-200 pb-3">
                            <span className="text-gray-500 font-medium">Order ID</span>
                            <span className="text-gray-900 font-bold">#{placedStatus.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span className="text-gray-500 font-medium">Amount Paid</span>
                            <span className="text-green-600 font-bold">₹{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-medium">Payment Mode</span>
                            <span className="text-gray-900 font-bold">{placedMode === 'COD' ? 'Cash on Delivery' : 'UPI'}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link
                            to={`/tracker?orderId=${placedStatus}`}
                            className="py-4 bg-[#E53935] text-white font-bold rounded-xl hover:bg-[#C62828] transition-colors shadow-lg shadow-red-500/30 w-full"
                        >
                            Track Order Live
                        </Link>
                        <Link
                            to="/menu"
                            className="py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors w-full"
                        >
                            Back to Menu
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-32 bg-[#f8f9fa]">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">

                {/* Header */}
                <div className="mb-8">
                    <Link to="/menu" className="inline-flex items-center gap-2 text-gray-500 font-semibold hover:text-[#E53935] transition-colors mb-6 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Menu
                    </Link>
                    <div className="flex items-end justify-between">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Secure Checkout</h1>
                        {cartItems.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-[#E53935] font-bold rounded-xl hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={16} />
                                Empty Cart
                            </button>
                        )}
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={40} className="text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Add some delicious dishes from the menu to start building your order.</p>
                        <Link
                            to="/menu"
                            className="inline-flex items-center px-8 py-4 bg-[#E53935] text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(229,57,53,0.25)] hover:shadow-[0_12px_24px_rgba(229,57,53,0.35)] hover:-translate-y-1 transition-all"
                        >
                            Explore Menu
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN: Cart Items & Details */}
                        <div className="lg:col-span-7 space-y-6">

                            {/* Item List */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-[#E53935]" />
                                    Your Order ({totalItems} items)
                                </h2>

                                <div className="space-y-6">
                                    {cartItems.map((item) => (
                                        <div key={item._id} className="flex gap-4">
                                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col pt-1">
                                                <div className="flex justify-between items-start gap-4 mb-2">
                                                    <h3 className="font-bold text-gray-900 leading-tight truncate">{item.name}</h3>
                                                    <button
                                                        onClick={() => removeFromCart(item._id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-gray-500 text-sm font-medium">₹{parseFloat(item.price).toFixed(2)} each</p>

                                                <div className="flex items-center gap-4 mt-auto">
                                                    {/* Qty Box */}
                                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm h-8 w-24">
                                                        <button
                                                            onClick={() => updateQty(item._id, item.qty - 1)}
                                                            className="px-2 h-full text-gray-500 hover:bg-gray-50 hover:text-[#E53935] transition-colors"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="flex-1 h-full flex items-center justify-center font-bold text-sm select-none border-x border-gray-100">{item.qty}</span>
                                                        <button
                                                            onClick={() => updateQty(item._id, item.qty + 1)}
                                                            className="px-2 h-full text-gray-500 hover:bg-gray-50 hover:text-green-600 transition-colors"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    <span className="font-bold text-gray-900 ml-auto">
                                                        ₹{(item.price * item.qty).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Details */}
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <MapPin size={20} className="text-[#E53935]" />
                                    Delivery Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1 md:col-span-2 relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Full Name"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-[#f8f9fa] border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 relative">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="Phone Number"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-[#f8f9fa] border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 relative">
                                        <MapPin size={18} className="absolute left-4 top-[22px] -translate-y-1/2 text-gray-400" />
                                        <textarea
                                            required
                                            placeholder="Full Delivery Address"
                                            value={form.address}
                                            onChange={e => setForm({ ...form, address: e.target.value })}
                                            rows={3}
                                            className="w-full pl-12 pr-4 py-3.5 bg-[#f8f9fa] border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium resize-none"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 relative">
                                        <input
                                            type="text"
                                            placeholder="Any cooking instructions? (optional)"
                                            value={form.notes}
                                            onChange={e => setForm({ ...form, notes: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-[#f8f9fa] border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Payment & Bill Summary */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-[100px] space-y-6">

                                {/* Bill Details */}
                                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Bill Summary</h2>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-gray-600 font-medium pb-4 border-b border-gray-100">
                                            <span>Item Total</span>
                                            <span>₹{totalPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 font-medium">
                                            <span>Delivery Fee</span>
                                            <span className="text-green-600 font-bold text-sm uppercase bg-green-50 px-2 py-0.5 rounded">Free</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 font-medium pb-4 border-b border-gray-100">
                                            <span>Platform Fee</span>
                                            <span>₹0.00</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-6">
                                        <span className="text-xl font-black text-gray-900">Total</span>
                                        <span className="text-3xl font-black text-[#E53935]">₹{totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Secure UPI Payment Area */}
                                <div className="bg-indigo-50/50 rounded-3xl border-2 border-indigo-100 p-6 shadow-sm relative overflow-hidden">
                                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <CreditCard size={24} className="text-indigo-600" />
                                        <h2 className="text-xl font-bold text-indigo-950">Secure UPI Payment</h2>
                                    </div>

                                    <div className="bg-white p-5 rounded-2xl border border-indigo-50 shadow-sm text-center mb-6 relative z-10">
                                        <img
                                            src={qrCodeUrl}
                                            alt="UPI QR Code"
                                            className="w-48 h-48 mx-auto object-contain mb-4 rounded-xl shadow-sm border border-gray-100 mix-blend-multiply"
                                        />
                                        <div className="bg-indigo-50 text-indigo-800 text-sm font-bold px-4 py-2 rounded-lg inline-block border border-indigo-100">
                                            Scan to Pay ₹{totalPrice.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="space-y-4 relative z-10 text-center">
                                        <p className="text-indigo-900/70 text-sm font-medium">Enter your 12-digit UPI Transaction ID after successful payment</p>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. 301234567890"
                                            value={form.transactionId}
                                            onChange={e => setForm({ ...form, transactionId: e.target.value.replace(/\D/g, '') })}
                                            maxLength="12"
                                            className="w-full px-5 py-4 bg-white border-2 border-indigo-100 rounded-2xl text-center text-indigo-950 placeholder-indigo-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-black text-lg tracking-widest"
                                        />
                                    </div>
                                </div>

                                {/* Final Checkout Button */}
                                <button
                                    onClick={(e) => handlePlaceOrder(e, 'UPI')}
                                    disabled={placing}
                                    className="w-full flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#E53935] to-[#C62828] text-white font-bold text-lg rounded-2xl hover:shadow-[0_12px_30px_rgba(229,57,53,0.35)] active:scale-[0.98] transition-all disabled:opacity-75 disabled:active:scale-100 group"
                                >
                                    <span className="flex-1 text-left">
                                        {placing ? 'Verifying payment...' : 'Place Order securely'}
                                    </span>

                                    {!placing && (
                                        <div className="flex items-center gap-2 bg-black/15 px-4 py-1.5 rounded-xl group-hover:bg-black/25 transition-colors">
                                            <span className="text-xl">₹{totalPrice.toFixed(2)}</span>
                                        </div>
                                    )}
                                </button>

                                <div className="text-center">
                                    <span className="text-gray-400 font-medium text-sm">OR</span>
                                </div>

                                {/* COD Button */}
                                <button
                                    onClick={(e) => handlePlaceOrder(e, 'COD')}
                                    disabled={placing}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold text-lg rounded-2xl hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all disabled:opacity-75 disabled:active:scale-100"
                                >
                                    {placing ? 'Placing Order...' : (
                                        <>
                                            <Banknote size={20} className="text-green-600" />
                                            Cash on Delivery
                                        </>
                                    )}
                                </button>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
