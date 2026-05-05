import { useState, useEffect } from "react";
import { 
    ShoppingBag, 
    User, 
    LogOut, 
    Clock, 
    Package, 
    MessageCircle, 
    CheckCircle, 
    XCircle, 
    ChevronRight, 
    Truck,
    Navigation,
    Phone,
    MapPin,
    AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile, getUserOrders } from "../services/api";
import { useUser } from "../context/UserContext";
import toast from "react-hot-toast";
import { OrderChat } from "../components/OrderChat";

const CustomerDashboard = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChatOrder, setActiveChatOrder] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchData();

        // Polling for updates while in dashboard
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [user]);

    const fetchData = async () => {
        try {
            const { data } = await getUserOrders();
            setOrders(data.orders);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
        toast.success("Logged out successfully");
    };

    const activeOrders = orders.filter(o => ['received', 'preparing', 'delivering'].includes(o.status));
    const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

    const getStatusStyle = (status) => {
        switch (status) {
            case 'received': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'preparing': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'delivering': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-[#E53935] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white">
                            <ShoppingBag size={22} />
                        </div>
                        <div>
                            <h1 className="font-black text-xl tracking-tight text-gray-900 uppercase leading-none">
                                My <span className="text-[#E53935]">Dashboard</span>
                            </h1>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Customer Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-gray-100">
                            <Link to="/profile" className="text-right hover:opacity-70 transition-opacity">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Welcome back</p>
                                <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                            </Link>
                            <Link to="/profile" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200 hover:bg-red-50 hover:text-[#E53935] transition-all">
                                <User size={20} />
                            </Link>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Logout"
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-screen-2xl mx-auto px-4 md:px-8 py-10">
                <div className={`flex flex-col ${activeChatOrder ? 'lg:flex-row' : ''} gap-6 md:gap-10`}>
                    {/* Left Side: Order & Stats */}
                    <div className={`flex-1 ${activeChatOrder ? 'lg:max-w-[calc(100%-480px)]' : ''}`}>
                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Orders</p>
                        <p className="text-3xl font-black text-gray-900">{orders.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Active</p>
                        <p className="text-3xl font-black text-[#E53935]">{activeOrders.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivered</p>
                        <p className="text-3xl font-black text-green-600">{pastOrders.filter(o => o.status === 'delivered').length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Loyalty Tier</p>
                        <p className="text-xl font-black text-orange-500 uppercase">Silver</p>
                    </div>
                </div>

                {/* Active Orders Section */}
                {activeOrders.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                                <Clock size={18} className="animate-spin-slow" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Active Deliveries</h2>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            {activeOrders.map(order => (
                                <div key={order._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden group">
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                <p className="mt-3 text-lg font-black text-gray-900">Active Order</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-900">₹{order.totalAmount}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#E53935] shadow-sm">
                                                    <MapPin size={18} />
                                                </div>
                                                <p className="text-xs font-bold text-gray-600 truncate">{order.customer.address}</p>
                                            </div>
                                            
                                            {order.deliveryPartner && (
                                                <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm bg-white flex items-center justify-center">
                                                        {order.deliveryPartner.photoUrl && order.customer?.gender === 'Female' ? (
                                                            <img src={order.deliveryPartner.photoUrl} alt="Partner" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                                <Truck size={18} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Delivery Partner</p>
                                                        <p className="text-sm font-bold text-gray-900">{order.deliveryPartner.name}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setActiveChatOrder(order)}
                                                        className="w-10 h-10 bg-[#E53935] text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-red-500/30"
                                                    >
                                                        <MessageCircle size={20} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            <Link 
                                                to={`/tracker?orderId=${order._id}`}
                                                className="flex-1 py-4 bg-black text-white text-center font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#E53935] transition-all flex items-center justify-center gap-2"
                                            >
                                                <Navigation size={14} />
                                                Live Tracker
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Past Orders Section */}
                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                <Package size={18} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Recent Orders</h2>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {pastOrders.length === 0 ? (
                            <div className="text-center py-20 grayscale opacity-50">
                                <ShoppingBag size={64} className="mx-auto mb-4" />
                                <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">No order history found</p>
                            </div>
                        ) : (
                            pastOrders.map(order => (
                                <div 
                                    key={order._id} 
                                    className="flex items-center justify-between p-6 rounded-3xl border border-gray-50 hover:bg-gray-50 transition-all group cursor-pointer"
                                    onClick={() => navigate(`/tracker?orderId=${order._id}`)}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {order.status === 'delivered' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 uppercase">Order #{order._id.slice(-6).toUpperCase()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                                {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} Items
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 text-right">
                                        <div>
                                            <p className="text-lg font-black text-gray-900">₹{order.totalAmount}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'text-green-600' : 'text-red-600'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-300 group-hover:text-black transition-colors" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                    </div>
                    
                    {/* Right Side: Chat Dashboard (Embedded, No Popups) */}
                    {activeChatOrder && (
                        <div className="w-full lg:w-[420px] shrink-0 animate-slide-in-right">
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl sticky top-24 overflow-hidden">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-[#E53935] flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                                            <MessageCircle size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Active Chat</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order #{activeChatOrder._id.slice(-6)}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setActiveChatOrder(null)}
                                        className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </div>

                                <div className="p-2 bg-gray-50/50">
                                    <OrderChat 
                                        orderId={activeChatOrder._id} 
                                        partnerName={activeChatOrder.deliveryPartner?.name?.split(' ')[0] || 'Partner'}
                                        partnerInitials={activeChatOrder.deliveryPartner?.name?.split(' ').map(n => n[0]).join('') || 'P'}
                                        currentUserRole="customer"
                                    />
                                </div>
                                <div className="p-4 bg-white border-t border-gray-50 text-center">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">End-to-End Encrypted Dashboard</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CustomerDashboard;
