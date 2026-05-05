import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Lock, Phone, MapPin, ArrowRight,
    ShieldCheck, Truck, UserCircle, RefreshCcw
} from 'lucide-react';
import {
    loginUser, registerUser,
    loginAdmin, registerAdmin,
    loginDeliveryBoy
} from '../services/api';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UnifiedAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('customer'); // customer, admin, delivery
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        gender: ''
    });

    const { login: customerLogin } = useUser();
    const { login: adminLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // AUTO-DETECT ROLE BASED LOGIN
                // Try logging in as customer first, then admin, then delivery
                let loginSuccess = false;
                
                // 1. Try Customer
                try {
                    const res = await loginUser({ email: formData.email, password: formData.password });
                    customerLogin(res.data.token, res.data.user);
                    toast.success('Welcome back!');
                    navigate('/menu');
                    loginSuccess = true;
                } catch (err) {
                    // Fail silently, try next role
                }

                // 2. Try Admin (if not already logged in)
                if (!loginSuccess) {
                    try {
                        const res = await loginAdmin({ email: formData.email, password: formData.password });
                        adminLogin(res.data.token, res.data.admin);
                        toast.success('Admin access granted');
                        navigate('/admin/dashboard');
                        loginSuccess = true;
                    } catch (err) {
                        // Fail silently, try next role
                    }
                }

                // 3. Try Delivery Boy (if not already logged in)
                if (!loginSuccess) {
                    try {
                        const res = await loginDeliveryBoy({ email: formData.email, password: formData.password });
                        localStorage.setItem('deliveryToken', res.data.token);
                        localStorage.setItem('deliveryInfo', JSON.stringify(res.data.deliveryBoy));
                        toast.success('Delivery panel ready');
                        navigate('/delivery/dashboard');
                        loginSuccess = true;
                    } catch (err) {
                        toast.error('Invalid credentials or account not found');
                    }
                }
            } else {
                // REGISTER - Keep role selection for account creation
                if (role === 'customer') {
                    const res = await registerUser(formData);
                    customerLogin(res.data.token, res.data.user);
                    toast.success('Account created!');
                    navigate('/menu');
                } else {
                    const payload = { ...formData, role };
                    const res = await registerAdmin(payload);
                    toast.success(res.data.message || 'Registration successful. Awaiting approval.');
                    setIsLogin(true);
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'customer', label: 'Customer', icon: UserCircle },
        { id: 'delivery', label: 'Delivery', icon: Truck },
        { id: 'admin', label: 'Admin', icon: ShieldCheck },
    ];

    return (
        <div className="min-h-screen bg-[#f4f7f6] pt-32 pb-12 flex items-center justify-center px-5 font-sans">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-10 md:p-12 border border-gray-100 relative">
                
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <h1 className="text-[#3c9c4c] text-4xl md:text-5xl font-extrabold mb-8 tracking-tight filter drop-shadow-sm">
                        KH'N CH'N
                    </h1>
                    
                    {/* Role Selection Tabs - ONLY SHOW FOR REGISTRATION */}
                    {!isLogin && (
                        <div className="flex justify-center gap-2 mb-8 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                            {roles.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setRole(r.id)}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${role === r.id
                                            ? `bg-white text-[#3c9c4c] shadow-sm border border-gray-100 ring-1 ring-gray-100`
                                            : `text-gray-400 hover:text-gray-600 hover:bg-gray-100/50`
                                        }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <p className="text-[#1a1a1a] font-bold text-xl md:text-2xl mt-4">
                        {isLogin ? 'Enter your login credentials' : 'Create your account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="block text-[#1a1a1a] font-bold text-[15px] ml-1">Full Name:</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-[#4caf50] focus:ring-0 transition-all font-medium outline-none"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-[#1a1a1a] font-bold text-[15px] ml-1">Email Address:</label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="Enter your Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-[#4caf50] focus:ring-0 transition-all font-medium outline-none"
                        />
                    </div>

                    {!isLogin && (role === 'customer' || role === 'delivery') && (
                        <div className="space-y-2">
                            <label className="block text-[#1a1a1a] font-bold text-[15px] ml-1">Phone Number:</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                placeholder="Enter your phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-[#4caf50] focus:ring-0 transition-all font-medium outline-none"
                            />
                        </div>
                    )}

                    {!isLogin && role === 'customer' && (
                        <div className="space-y-2">
                            <label className="block text-[#1a1a1a] font-bold text-[15px] ml-1">Address:</label>
                            <textarea
                                name="address"
                                required
                                placeholder="Enter your address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-[#4caf50] focus:ring-0 transition-all font-medium outline-none resize-none"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-[#1a1a1a] font-bold text-[15px] ml-1">Password:</label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="Enter your Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-[#4caf50] focus:ring-0 transition-all font-medium outline-none"
                        />
                    </div>

                    {!isLogin && role === 'customer' && (
                        <div className="space-y-2">
                            <label className="block text-[#1a1a1a] font-bold text-[15px] ml-1">Gender:</label>
                            <select
                                name="gender"
                                required
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-[#4caf50] focus:ring-0 transition-all font-medium outline-none appearance-none"
                            >
                                <option value="" disabled>Select your gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#4caf50] text-white font-bold rounded-xl hover:bg-[#43a047] transition-all flex items-center justify-center gap-3 text-lg shadow-sm active:scale-[0.98] mt-8"
                    >
                        {loading ? (
                            <RefreshCcw className="animate-spin" size={22} />
                        ) : (
                            <>{isLogin ? 'Submit' : 'Register'}</>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-gray-700 font-medium">
                        {isLogin ? "Not registered? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[#6c5ecf] font-bold hover:underline ml-1"
                        >
                            {isLogin ? "Create an account" : "Sign in here"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UnifiedAuth;
