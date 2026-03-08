import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreditCard, User, ArrowLeft } from 'lucide-react';
import { loginDeliveryBoy } from '../../services/api';

const DeliveryLogin = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await loginDeliveryBoy(form);
            localStorage.setItem('deliveryToken', data.token);
            toast.success('🚚 Delivery boy logged in!');
            navigate('/delivery/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] pt-24 pb-32">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
                <div className="flex items-center mb-6">
                    <User size={32} className="text-[#E53935] mr-2" />
                    <h1 className="text-2xl font-black text-gray-900">Delivery Boy Login</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type="email"
                            required
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3.5 bg-[#f8f9fa] border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium"
                        />
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full pl-10 pr-4 py-3.5 bg-[#f8f9fa] border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium"
                        />
                        <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-[#E53935] text-white font-bold rounded-xl hover:bg-[#C62828] transition-colors shadow-lg"
                    >
                        Sign In
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <Link to="/" className="text-gray-600 hover:text-[#E53935] transition-colors inline-flex items-center">
                        <ArrowLeft size={16} className="mr-1" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DeliveryLogin;
