import { useState, useEffect } from 'react';
import { useDeliverySocket } from '../../hooks/useDeliverySocket';
import { getDeliveryProfile, updateDeliveryWorkStatus } from '../../services/api';
import { OrderRequestPopup } from '../../components/delivery/OrderRequestPopup';
import { Truck, Navigation, Package, DollarSign, LogOut, Shield, ChevronRight, MapPin, Phone, MessageSquare } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const DeliveryDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [status, setStatus] = useState('OFFLINE');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    // Custom hook for real-time order requests
    const { newOrderRequest, acceptOrder, rejectOrder } = useDeliverySocket(profile?.id || profile?._id);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await getDeliveryProfile();
            setProfile(data.deliveryBoy);
            setStatus(data.deliveryBoy.workStatus);
        } catch (error) {
            console.error(error);
            // navigate('/delivery/login');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (newStatus) => {
        try {
            const { data } = await updateDeliveryWorkStatus(newStatus);
            setStatus(newStatus);
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('deliveryToken');
        navigate('/delivery/login');
        toast.success("Logged out successfully");
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#E53935] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-24">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 shadow-sm px-6 py-5 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Truck size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-gray-900 tracking-tight uppercase leading-none">
                                Partner <span className="text-[#E53935]">App</span>
                            </h1>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{profile?.assignedArea || 'Global'}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-500 transition-colors">
                        <LogOut size={22} />
                    </button>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 pt-10">
                {/* Status Toggle Card */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                    
                    <div className="relative flex items-center justify-between mb-8">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current System Status</p>
                            <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full animate-pulse ${
                                    status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' :
                                    status === 'BUSY' ? 'bg-orange-500' :
                                    'bg-gray-400'
                                }`} />
                                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{status}</h2>
                            </div>
                        </div>
                        {status === 'OFFLINE' ? (
                            <button 
                                onClick={() => handleStatusToggle('ACTIVE')}
                                className="px-8 py-4 bg-[#E53935] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 hover:bg-black transition-all active:scale-95"
                            >
                                Go Active
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleStatusToggle('OFFLINE')}
                                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-red-600 transition-all active:scale-95"
                            >
                                Go Offline
                            </button>
                        )}
                    </div>

                    <div className="relative grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Today's Earnings</p>
                            <p className="text-2xl font-black text-gray-900">₹{profile?.todayEarnings || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Drops</p>
                            <p className="text-2xl font-black text-gray-900">{profile?.totalDeliveries || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Active Orders */}
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-6 mb-4">Quick Navigation</h3>
                <div className="space-y-4">
                    <Link to="/delivery/history" className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:translate-x-2 transition-transform group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Package size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 uppercase">Delivery History</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">View past earnings</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-black" />
                    </Link>

                    <Link to="/delivery/profile" className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:translate-x-2 transition-transform group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Shield size={22} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 uppercase">Security & Profile</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identity verified</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-black" />
                    </Link>
                </div>
            </main>

            {/* Current Request Popup */}
            {newOrderRequest && (
                <OrderRequestPopup 
                    order={newOrderRequest} 
                    onAccept={async (orderId) => {
                        acceptOrder(orderId);
                        navigate(`/delivery/active-order/${orderId}`);
                    }}
                    onReject={() => rejectOrder(newOrderRequest.orderId)}
                />
            )}

            {/* Bottom Nav Mock (Mobile) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center p-4 z-40 md:hidden">
                <Link to="/delivery/dashboard" className="flex flex-col items-center gap-1 text-[#E53935]">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                        <Navigation size={22} />
                    </div>
                </Link>
                <Link to="/delivery/orders" className="flex flex-col items-center gap-1 text-gray-400">
                    <div className="w-12 h-12 hover:bg-gray-50 rounded-2xl flex items-center justify-center transition-colors">
                        <Package size={22} />
                    </div>
                </Link>
                <Link to="/delivery/profile" className="flex flex-col items-center gap-1 text-gray-400">
                    <div className="w-12 h-12 hover:bg-gray-50 rounded-2xl flex items-center justify-center transition-colors">
                        <Shield size={22} />
                    </div>
                </Link>
            </nav>
        </div>
    );
};

export default DeliveryDashboard;
