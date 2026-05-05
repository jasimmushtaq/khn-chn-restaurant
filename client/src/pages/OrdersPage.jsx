import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CheckCircle, CreditCard, User, MapPin, Phone, Banknote, ChevronDown, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder, BASE_URL, createRazorpayOrder, verifyRazorpayPayment, getSettings, createStripeIntent, confirmStripePayment } from '../services/api';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import { detectGender } from '../utils/genderDetection';

const OrdersPage = () => {
    const { cartItems, removeFromCart, updateQty, clearCart, totalItems, totalPrice } = useCart();
    const { user } = useUser();
    const [placing, setPlacing] = useState(false);
    const [placedStatus, setPlacedStatus] = useState(null);
    const [placedMode, setPlacedMode] = useState(null);
    const [settings, setSettings] = useState(null);

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        gender: user?.gender || 'Other',
        area: 'General',
        transactionId: '',
        notes: ''
    });

    // Automatic Gender Detection Effect
    useEffect(() => {
        if (form.name) {
            const detectedValue = detectGender(form.name);
            if (detectedValue !== 'Other') {
                setForm(prev => ({ ...prev, gender: detectedValue }));
            }
        }
    }, [form.name]);
    const navigate = useNavigate();

    useEffect(() => {
        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        // Fetch Platform Settings (for UPI details)
        const fetchSettings = async () => {
            try {
                const { data } = await getSettings();
                setSettings(data.settings);
            } catch (err) {
                console.error('Failed to fetch platform settings:', err);
            }
        };
        fetchSettings();
    }, []);

    const handleRazorpayPayment = async (e) => {
        e.preventDefault();
        if (!form.name || !form.phone || !form.address) {
            toast.error('Please fill in Name, Phone, and Address');
            return;
        }

        setPlacing(true);
        try {
            if (!window.Razorpay) {
                toast.error('Payment gateway is still loading. Please wait a moment.');
                setPlacing(false);
                return;
            }
            // 1. Create Razorpay Order on Backend
            const { data: orderData } = await createRazorpayOrder(totalPrice);

            // --- DEEP INTEGRATION: DEMO MODE HANDLING ---
            if (orderData.demo) {
                console.log('--- [PRO MODE] SIMULATING RAZORPAY SUCCESS ---');
                toast.loading('Connecting to secure gateway...', { duration: 1000 });
                
                setTimeout(async () => {
                    const dummyResponse = {
                        razorpay_order_id: orderData.order_id,
                        razorpay_payment_id: `pay_DEMO_${Date.now()}`,
                        razorpay_signature: "demo_signature"
                    };
                    
                    const payload = {
                        ...dummyResponse,
                        customer: {
                            name: form.name,
                            phone: form.phone,
                            address: form.address,
                            gender: form.gender,
                        },
                        area: form.area,
                        items: cartItems.map(item => ({
                            dishId: item._id,
                            name: item.name,
                            price: item.price,
                            qty: item.qty,
                            image: item.image,
                            category: item.category
                        })),
                        totalAmount: totalPrice,
                        notes: form.notes,
                        userId: user?.id || user?._id
                    };

                    try {
                        const verifyRes = await verifyRazorpayPayment(payload);
                        setPlacedStatus(verifyRes.data.order._id);
                        setPlacedMode('Razorpay (UPI/Card)');
                        clearCart();
                        toast.success('🎉 Success! Order placed via Demo Payment');
                    } catch (err) {
                        toast.error('Payment simulation failed. Please try again.');
                    } finally {
                        setPlacing(false);
                    }
                }, 1500);
                return;
            }

            // 2. Open REAL Razorpay Checkout
            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: "INR",
                name: "KH'N CH'N RESTAURANT",
                description: "Secure Order Payment",
                image: "https://res.cloudinary.com/dhaggdroo/image/upload/v1/restaurant/logo.png",
                order_id: orderData.order_id,
                handler: async (response) => {
                    setPlacing(true);
                    try {
                        const payload = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            customer: {
                                name: form.name,
                                phone: form.phone,
                                address: form.address,
                                gender: form.gender,
                            },
                            area: form.area,
                            items: cartItems.map(item => ({
                                dishId: item._id,
                                name: item.name,
                                price: item.price,
                                qty: item.qty,
                                image: item.image,
                                category: item.category
                            })),
                            totalAmount: totalPrice,
                            notes: form.notes,
                            userId: user?.id || user?._id
                        };

                        const verifyRes = await verifyRazorpayPayment(payload);
                        setPlacedStatus(verifyRes.data.order._id);
                        setPlacedMode('Razorpay (UPI/Card)');
                        clearCart();
                        toast.success('🎉 Transaction successful! Order confirmed.');
                    } catch (err) {
                        toast.error(err.response?.data?.message || 'Verification failed. Please contact support.');
                    } finally {
                        setPlacing(false);
                    }
                },
                prefill: {
                    name: form.name,
                    contact: form.phone,
                    email: user?.email || "",
                },
                notes: {
                    address: form.address
                },
                theme: {
                    color: "#E53935",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error(`Payment ${response.error.reason}: ${response.error.description}`);
            });
            rzp.open();

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setPlacing(false);
        }
    };

    const handlePlaceOrder = async (e, method = 'COD') => {
        e.preventDefault();
        if (!form.name || !form.phone || !form.address) {
            toast.error('Please fill in Name, Phone, and Address');
            return;
        }

        setPlacing(true);
        try {
            const payload = {
                customer: {
                    name: form.name,
                    phone: form.phone,
                    address: form.address,
                    gender: form.gender,
                },
                area: form.area,
                items: cartItems.map(item => ({
                    dishId: item._id,
                    name: item.name,
                    price: item.price,
                    qty: item.qty,
                    image: item.image,
                    category: item.category
                })),
                totalAmount: totalPrice,
                transactionId: method === 'Cash on Delivery' ? 'CASH ON DELIVERY' : 'PAID',
                notes: form.notes,
                userId: user?.id || user?._id
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
                        <div className="flex justify-between pb-3 border-b border-gray-200">
                            <span className="text-gray-500 font-medium">Amount Paid</span>
                            <span className="text-green-600 font-bold">₹{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span className="text-gray-500 font-medium">Payment Mode</span>
                            <span className="text-gray-900 font-bold">{placedMode}</span>
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
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={40} className="text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Add some delicious dishes from the menu to start building your order.</p>
                        <Link to="/menu" className="inline-flex items-center px-8 py-4 bg-[#E53935] text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(229,57,53,0.25)] hover:shadow-[0_12px_24px_rgba(229,57,53,0.35)] hover:-translate-y-1 transition-all">
                            Explore Menu
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-[#E53935]" />
                                    Your Order ({totalItems} items)
                                </h2>

                                <div className="space-y-6">
                                    {cartItems.map((item) => (
                                        <div key={item._id} className="flex gap-4">
                                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100">
                                                <img src={item.image?.startsWith('http') ? item.image : `${BASE_URL}${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col pt-1">
                                                <div className="flex justify-between items-start gap-4 mb-2">
                                                    <h3 className="font-bold text-gray-900 leading-tight truncate">{item.name}</h3>
                                                    <button onClick={() => removeFromCart(item._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <p className="text-gray-500 text-sm font-medium">₹{parseFloat(item.price).toFixed(2)} each</p>
                                                <div className="flex items-center gap-4 mt-auto">
                                                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm h-8 w-24">
                                                        <button onClick={() => updateQty(item._id, item.qty - 1)} className="px-2 h-full text-gray-500 hover:bg-gray-50 hover:text-[#E53935] transition-colors"><Minus size={14} /></button>
                                                        <span className="flex-1 h-full flex items-center justify-center font-bold text-sm select-none border-x border-gray-100">{item.qty}</span>
                                                        <button onClick={() => updateQty(item._id, item.qty + 1)} className="px-2 h-full text-gray-500 hover:bg-gray-50 hover:text-green-600 transition-colors"><Plus size={14} /></button>
                                                    </div>
                                                    <span className="font-bold text-gray-900 ml-auto">₹{(item.price * item.qty).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <MapPin size={20} className="text-[#E53935]" />
                                    Delivery Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1 md:col-span-2 relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" required placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full pl-12 pr-4 py-3.5 bg-[#f8f9fa] border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 relative">
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="tel" required placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full pl-12 pr-4 py-3.5 bg-[#f8f9fa] border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium" />
                                    </div>
                                    <div className="hidden">
                                        <input type="hidden" value={form.gender} />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 relative">
                                        <MapPin size={18} className="absolute left-4 top-[22px] -translate-y-1/2 text-gray-400" />
                                        <textarea required placeholder="Full Delivery Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={3} className="w-full pl-12 pr-4 py-3.5 bg-[#f8f9fa] border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium resize-none" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 relative">
                                        <select 
                                            value={form.area} 
                                            onChange={e => setForm({ ...form, area: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-[#f8f9fa] border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium text-sm appearance-none"
                                        >
                                            <option value="General">Select Delivery Area (for faster assignment)</option>
                                            <option value="North Zone">North Zone</option>
                                            <option value="South Zone">South Zone</option>
                                            <option value="East Zone">East Zone</option>
                                            <option value="West Zone">West Zone</option>
                                            <option value="Central Market">Central Market</option>
                                            <option value="City Center">City Center</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronDown size={18} className="text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 relative">
                                        <input type="text" placeholder="Any cooking instructions? (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-3.5 bg-[#f8f9fa] border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="sticky top-[100px] space-y-6">
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

                                <button
                                    onClick={handleRazorpayPayment}
                                    disabled={placing}
                                    className="w-full flex items-center justify-center py-5 bg-gradient-to-r from-[#E53935] to-[#C62828] text-white font-bold text-lg rounded-2xl hover:shadow-[0_12px_30px_rgba(229,57,53,0.35)] active:scale-[0.98] transition-all disabled:opacity-75 disabled:active:scale-100 group relative overflow-hidden mb-4"
                                >
                                    <span className="relative z-10 text-xl font-black uppercase tracking-tight">
                                        {placing ? 'Processing...' : 'Pay Now'}
                                    </span>
                                    <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-25 group-hover:left-[100%] transition-all duration-1000"></div>
                                </button>

                                <button
                                    onClick={(e) => handlePlaceOrder(e, 'Cash on Delivery')}
                                    disabled={placing}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold text-lg rounded-2xl hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all disabled:opacity-75 disabled:active:scale-100"
                                >
                                    {placing ? 'Placing Order...' : (
                                        <>
                                            <Banknote size={20} className="text-green-600" />
                                            Complete Order (Cash on Delivery)
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
