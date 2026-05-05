import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateDeliveryOrderStatus, updateDeliveryWorkStatus } from '../../services/api';
import { OrderChat } from '../../components/OrderChat';
import { MapPin, Phone, MessageSquare, CheckCircle, Navigation, ChevronLeft, Truck, Clock, ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ActiveOrder = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrder();
        // Polling for updates if needed, though socket is better
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const { data } = await getOrderById(orderId);
            setOrder(data.order);
        } catch (error) {
            toast.error("Failed to load order");
            navigate('/delivery/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (newStatus) => {
        try {
            await updateDeliveryOrderStatus(orderId, newStatus);
            toast.success(`Order marked as ${newStatus}`);
            if (newStatus === 'delivered' || newStatus === 'cancelled') {
                navigate('/delivery/dashboard');
            } else {
                fetchOrder();
            }
        } catch (error) {
            toast.error("Action failed");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#E53935] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const getBtnConfig = () => {
        if (order.status === 'preparing' || order.status === 'received') {
            return {
                label: 'GOING FOR DROP',
                icon: <Truck size={20} />,
                color: 'bg-black',
                action: () => handleAction('delivering')
            };
        }
        if (order.status === 'delivering') {
            return {
                label: 'ORDER DELIVERED',
                icon: <CheckCircle size={20} />,
                color: 'bg-green-600',
                action: () => handleAction('delivered')
            };
        }
        return null;
    };

    const btn = getBtnConfig();

    return (
        <div className="min-h-screen bg-[#FDFEFE] pb-24">
            {/* Header */}
            <div className="bg-white px-6 py-6 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-40 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Active <span className="text-[#E53935]">Drop</span></h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Order #{orderId.slice(-6).toUpperCase()}</p>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-6 pt-8 space-y-6">
                {/* Order Status Badge */}
                <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-gray-50 border border-gray-100 rounded-full">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.status}</span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-red-50/50 rounded-full -mr-20 -mt-20 blur-3xl" />
                    
                    <div className="relative space-y-10">
                        {/* Address */}
                        <div className="flex gap-6">
                            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-[#E53935] flex-shrink-0 shadow-inner">
                                <MapPin size={32} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Drop Destination</h4>
                                <p className="text-lg font-bold text-gray-900 leading-tight mb-4">{order.customer?.address}</p>
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer?.address)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E53935] transition-all"
                                >
                                    <Navigation size={14} />
                                    Open Map
                                </a>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                                <p className="text-sm font-black text-gray-900">{order.customer?.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment</p>
                                <p className="text-sm font-black text-green-600 uppercase">{order.transactionId === 'CASH ON DELIVERY' ? 'CASH (COD)' : 'PAID ONLINE'}</p>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-4">Items Summary</h4>
                            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 space-y-3">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm font-bold">
                                        <p className="text-gray-600"><span className="text-black mr-2">x{item.qty}</span> {item.name}</p>
                                        <p className="text-gray-900">₹{item.price * item.qty}</p>
                                    </div>
                                ))}
                                <div className="pt-4 mt-2 border-t border-gray-50 flex justify-between items-center">
                                    <p className="text-xs font-black text-gray-400 uppercase">Bill Total</p>
                                    <p className="text-2xl font-black text-[#E53935]">₹{order.totalAmount}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <a 
                        href={`tel:${order.customer?.phone}`}
                        className="py-6 bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-blue-50 transition-colors group"
                    >
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Phone size={24} />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Call Customer</span>
                    </a>
                    <button 
                         onClick={() => setShowChat(true)}
                        className="py-6 bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-orange-50 transition-colors group"
                    >
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            <MessageSquare size={24} />
                        </div>
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Open Chat</span>
                    </button>
                </div>

                {/* Progressive Action Button */}
                {btn && (
                    <button 
                        onClick={btn.action}
                        className={`w-full py-6 ${btn.color} text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all`}
                    >
                        {btn.icon}
                        {btn.label}
                    </button>
                )}
            </main>

            {/* Chat Sidebar/Modal */}
            {showChat && (
                <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
                    <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E53935] rounded-2xl flex items-center justify-center text-white">
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 uppercase tracking-tight">Support Chat</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.customer?.name}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowChat(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <ChevronLeft size={24} className="rotate-180" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden p-2">
                        <OrderChat 
                            orderId={orderId} 
                            partnerName={order.customer?.name}
                            partnerInitials={order.customer?.name?.[0]}
                            currentUserRole="delivery"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveOrder;
