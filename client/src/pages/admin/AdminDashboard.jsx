import { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, MessageSquare, UtensilsCrossed, Image as ImageIcon, TrendingUp, Users } from 'lucide-react';
import { getAllDishes, getAllPostersAdmin, getAllOrders, getAllReservations, getAllReviews } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ dishes: 0, posters: 0, orders: 0, revenue: 0, reservations: 0, feedback: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [dRes, pRes, oRes, rRes, fRes] = await Promise.all([
                getAllDishes(),
                getAllPostersAdmin(),
                getAllOrders(),
                getAllReservations(),
                getAllReviews()
            ]);

            const orders = oRes.data.orders;
            const totalRev = orders.reduce((sum, order) => sum + order.totalAmount, 0);

            setStats({
                dishes: dRes.data.dishes.length,
                posters: pRes.data.posters.length,
                orders: orders.length,
                revenue: totalRev,
                reservations: rRes.data.reservations.length,
                feedback: fRes.data.reviews.length
            });
        } catch (err) {
            toast.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 font-bold text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Overview</h1>
                <p className="text-gray-500 font-medium">Welcome back, here is your KHN CHN summary.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {/* Revenue */}
                <div className="bg-gradient-to-br from-[#E53935] to-[#C62828] rounded-3xl p-6 text-white shadow-lg shadow-red-500/20 relative overflow-hidden group">
                    <TrendingUp className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp size={20} className="text-white" />
                        </div>
                        <h3 className="font-bold text-white/90">Total Revenue</h3>
                    </div>
                    <p className="text-4xl font-black">₹{stats.revenue.toLocaleString()}</p>
                </div>

                {/* Orders */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <ShoppingBag className="absolute -right-6 -bottom-6 w-32 h-32 text-gray-50 opacity-50" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                            <ShoppingBag size={20} className="text-orange-500" />
                        </div>
                        <h3 className="font-bold text-gray-500">Orders</h3>
                    </div>
                    <p className="text-4xl font-black text-gray-900">{stats.orders}</p>
                </div>

                {/* Reservations */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <Calendar className="absolute -right-6 -bottom-6 w-32 h-32 text-gray-50 opacity-50" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Calendar size={20} className="text-blue-500" />
                        </div>
                        <h3 className="font-bold text-gray-500">Table Bookings</h3>
                    </div>
                    <p className="text-4xl font-black text-gray-900">{stats.reservations}</p>
                </div>

                {/* Feedback */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <MessageSquare className="absolute -right-6 -bottom-6 w-32 h-32 text-gray-50 opacity-50" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                            <MessageSquare size={20} className="text-yellow-500" />
                        </div>
                        <h3 className="font-bold text-gray-500">Feedback</h3>
                    </div>
                    <p className="text-4xl font-black text-gray-900">{stats.feedback}</p>
                </div>

                {/* Dishes */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <UtensilsCrossed className="absolute -right-6 -bottom-6 w-32 h-32 text-gray-50 opacity-50" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <UtensilsCrossed size={20} className="text-green-500" />
                        </div>
                        <h3 className="font-bold text-gray-500">Menu Items</h3>
                    </div>
                    <p className="text-4xl font-black text-gray-900">{stats.dishes}</p>
                </div>

                {/* Posters */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <ImageIcon className="absolute -right-6 -bottom-6 w-32 h-32 text-gray-50 opacity-50" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                            <ImageIcon size={20} className="text-purple-500" />
                        </div>
                        <h3 className="font-bold text-gray-500">Promotions</h3>
                    </div>
                    <p className="text-4xl font-black text-gray-900">{stats.posters}</p>
                </div>

            </div>

        </div>
    );
};

export default AdminDashboard;
