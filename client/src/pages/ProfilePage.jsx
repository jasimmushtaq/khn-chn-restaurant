import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, Clock, CheckCircle, Truck, XCircle, LogOut, ChevronRight, Trash2 } from 'lucide-react';
import { getUserProfile, getUserOrders, updateUserProfile, deleteUserProfile } from '../services/api';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import { detectGender } from '../utils/genderDetection';
import { ShieldCheck } from 'lucide-react';

const ProfilePage = () => {
    const { user, logout, login } = useUser();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        gender: user?.gender || 'Other'
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [profileRes, ordersRes] = await Promise.all([
                getUserProfile(),
                getUserOrders()
            ]);
            setOrders(ordersRes.data.orders);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await updateUserProfile(formData);
            login(localStorage.getItem('userToken'), res.data.user);
            setIsEditing(false);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        toast.success('Logged out successfully');
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
            try {
                await deleteUserProfile();
                logout();
                navigate('/');
                toast.success('Account deleted successfully');
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete account');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 bg-[#f8f9fa] px-5 sm:px-8">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">

                {/* Profile Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4 border-2 border-red-100">
                                <User size={40} className="text-[#E53935]" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">{user?.name}</h2>
                            <p className="text-gray-500 font-medium">{user?.email}</p>
                        </div>

                        {!isEditing ? (
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                    <Phone size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                                        <p className="font-bold text-gray-900">{user?.phone || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                    <MapPin size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Address</p>
                                        <p className="font-bold text-gray-900 text-sm">{user?.address || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                    <User size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Gender</p>
                                        <p className="font-bold text-gray-900 text-sm">{user?.gender || 'Not set'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full py-4 text-[#E53935] font-bold border-2 border-red-50 rounded-2xl hover:bg-red-50 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdate} className="space-y-4 mb-8">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Name"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-medium"
                                />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Phone"
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-medium"
                                />
                                <textarea
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Address"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-medium resize-none"
                                />
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl font-medium"
                                >
                                    <option value="" disabled>Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                                <div className="flex gap-3">
                                    <button type="submit" className="flex-1 py-3 bg-[#E53935] text-white font-bold rounded-xl shadow-lg shadow-red-500/20">Save</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl">Cancel</button>
                                </div>
                            </form>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full py-4 flex items-center justify-center gap-2 text-gray-400 font-bold hover:text-red-500 transition-colors pt-6 border-t border-gray-100"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>

                        <button
                            onClick={handleDeleteAccount}
                            className="w-full py-4 flex items-center justify-center gap-2 text-gray-300 font-bold hover:text-red-700 transition-colors text-xs"
                        >
                            <Trash2 size={14} />
                            Delete My Account
                        </button>
                    </div>
                </div>

                {/* Orders History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <Package size={24} className="text-[#E53935]" />
                            Order History
                        </h2>
                        <span className="px-4 py-1.5 bg-white rounded-full text-sm font-bold text-gray-500 border border-gray-100 shadow-sm">
                            {orders.length} Orders
                        </span>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                            <Package size={48} className="text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">You haven't placed any orders yet.</p>
                            <button onClick={() => navigate('/menu')} className="mt-4 text-[#E53935] font-black hover:underline">Browse Menu</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/tracker?orderId=${order._id}`)}>
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Order</p>
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-gray-400" />
                                                <p className="text-sm font-bold text-gray-500">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-gray-900">₹{order.totalAmount.toFixed(0)}</p>
                                            <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-orange-50 text-orange-600 border-orange-100'
                                                }`}>
                                                {order.status === 'delivered' ? <CheckCircle size={10} /> :
                                                    order.status === 'cancelled' ? <XCircle size={10} /> :
                                                        <Truck size={10} />}
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <p className="text-sm font-medium text-gray-500">
                                            {order.items.length} item{order.items.length > 1 ? 's' : ''} • {order.items.map(i => i.name).join(', ').slice(0, 40)}...
                                        </p>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#E53935] transition-colors">
                                            <ChevronRight size={18} className="text-gray-300 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
