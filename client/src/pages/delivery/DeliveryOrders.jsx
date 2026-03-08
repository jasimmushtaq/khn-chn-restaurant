import { useState, useEffect } from "react";
import { getDeliveryOrders, updateDeliveryOrderStatus, getDeliveryProfile } from "../../services/api";
import toast from "react-hot-toast";
import {
    Truck,
    Phone,
    MapPin,
    CheckCircle,
    LogOut,
    Clock,
    Navigation,
    ShoppingBag,
    User,
    X,
    Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DeliveryOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await getDeliveryProfile();
            setProfile(data.deliveryBoy);
        } catch (e) { console.error(e); }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await getDeliveryOrders();
            setOrders(data.orders || []);
        } catch (error) {
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await updateDeliveryOrderStatus(orderId, newStatus);
            toast.success(`Order updated to ${newStatus}`);
            fetchOrders();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("deliveryToken");
        navigate("/delivery/login");
        toast.success("Logged out successfully");
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'received': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'preparing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'delivering': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#E53935] rounded-lg flex items-center justify-center text-white">
                            <Truck size={18} />
                        </div>
                        <h1 className="font-black text-xl tracking-tight text-gray-900 uppercase">
                            Delivery <span className="text-[#E53935]">Panel</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowProfile(true)}
                            className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl hover:bg-red-50 transition-all border border-gray-100"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                <User size={16} />
                            </div>
                            <div className="hidden sm:block text-left pr-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Partner</p>
                                <p className="text-xs font-bold text-gray-900 leading-none">{profile?.name || 'Loading...'}</p>
                            </div>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-600 hover:text-red-600 transition-colors bg-gray-50 rounded-xl"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Incoming Orders</h2>
                        <p className="text-sm text-gray-500 font-medium">Manage your deliveries efficiently</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block">Level</span>
                        <span className="text-lg font-black text-[#E53935]">BHOJAN PARTNER</span>
                    </div>
                </div>

                {loading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white h-48 rounded-3xl animate-pulse shadow-sm border border-gray-100"></div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-black text-gray-900 mb-1 uppercase tracking-tight">No Active Orders</h3>
                        <p className="text-gray-500 text-sm font-medium">Rest well! We'll notify you when a new order arrives.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                {/* Status Header */}
                                <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        {/* Customer Details */}
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#E53935] flex-shrink-0">
                                                    <MapPin size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Address</h4>
                                                    <p className="text-sm font-bold text-gray-900 leading-relaxed">{order.customer?.address || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                                    <Phone size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Details</h4>
                                                    <p className="text-sm font-bold text-gray-900">{order.customer?.name}</p>
                                                    <a href={`tel:${order.customer?.phone}`} className="text-lg font-black text-gray-900 hover:text-[#E53935] transition-colors flex items-center gap-1">
                                                        {order.customer?.phone}
                                                        <Navigation size={14} className="opacity-40" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items & Summary */}
                                        <div className="bg-gray-50/50 rounded-3xl p-5 border border-gray-100">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Order Summary</h4>
                                            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <span className="font-bold text-gray-700">
                                                            <span className="text-[#E53935] mr-2">×{item.qty}</span>
                                                            {item.name || 'Item'}
                                                        </span>
                                                        <span className="font-black text-gray-900">₹{(item.price * item.qty).toFixed(0)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-3 border-t border-gray-200/50 flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Total to Collect</span>
                                                <span className="text-xl font-black text-[#E53935]">₹{order.totalAmount.toFixed(0)}</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${order.transactionId === 'CASH ON DELIVERY' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                    {order.transactionId === 'CASH ON DELIVERY' ? 'Collect Cash' : 'Paid Online'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-8 flex gap-3">
                                        {order.status === 'received' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'preparing')}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                                            >
                                                <Clock size={18} />
                                                Start Preparing
                                            </button>
                                        )}
                                        {order.status === 'preparing' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'delivering')}
                                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-purple-200 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                                            >
                                                <Truck size={18} />
                                                Out for Delivery
                                            </button>
                                        )}
                                        {order.status === 'delivering' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order._id, 'delivered')}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-green-200 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                                            >
                                                <CheckCircle size={18} />
                                                Mark Delivered
                                            </button>
                                        )}
                                        {order.status === 'delivered' && (
                                            <div className="flex-1 bg-gray-100 text-gray-400 font-black py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-sm cursor-not-allowed">
                                                <CheckCircle size={18} />
                                                Completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Profile Modal */}
            {showProfile && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-22xl p-8 relative animate-scale-up">
                        <button
                            onClick={() => setShowProfile(false)}
                            className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-[#E53935] mx-auto mb-4 border-2 border-white shadow-xl">
                                <User size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">My Profile</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{profile?.role || 'Delivery Partner'}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Full Name</p>
                                    <p className="font-bold text-gray-900">{profile?.name || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                                    <Mail size={18} title="Email" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
                                    <p className="font-bold text-gray-900 truncate">{profile?.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Phone</p>
                                    <p className="font-bold text-gray-900 leading-none">{profile?.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowProfile(false)}
                            className="w-full mt-8 py-4 bg-gray-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-[#E53935] transition-all shadow-lg"
                        >
                            Close Profile
                        </button>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            ` }} />
        </div>
    );
};

export default DeliveryOrders;
