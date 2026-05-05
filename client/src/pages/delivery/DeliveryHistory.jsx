import { useState, useEffect } from 'react';
import { getDeliveryOrders } from '../../services/api';
import { ChevronLeft, ShoppingBag, CheckCircle, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeliveryHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await getDeliveryOrders();
            // Filter only delivered orders for history
            setOrders((data.orders || []).filter(o => o.status === 'delivered'));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#E53935] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const totalEarnings = orders.reduce((acc, curr) => acc + (curr.totalAmount * 0.1), 0);

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-24">
             {/* Header */}
             <div className="bg-white px-6 py-6 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-40 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Earnings <span className="text-[#E53935]">History</span></h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Partner Life</p>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-6 pt-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
                        <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-4">
                            <DollarSign size={20} />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Earned</p>
                        <p className="text-3xl font-black text-gray-900">₹{totalEarnings.toFixed(0)}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
                        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                            <CheckCircle size={20} />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Drops Done</p>
                        <p className="text-3xl font-black text-gray-900">{orders.length}</p>
                    </div>
                </div>

                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-6 mb-6">Recent Completion</h3>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4 grayscale" />
                        <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">No orders completed yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#E53935] group-hover:text-white transition-all">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            {new Date(order.createdAt).toLocaleDateString()} • {order.customer?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-gray-900">₹{Math.round(order.totalAmount * 0.1)}</p>
                                    <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Commission</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DeliveryHistory;
