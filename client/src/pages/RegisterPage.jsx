import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react';
import { registerUser } from '../services/api';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        gender: ''
    });
    const [loading, setLoading] = useState(false);
    const { login } = useUser();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await registerUser(formData);
            login(res.data.token, res.data.user);
            toast.success('Account created successfully!');
            navigate('/menu');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[#f8f9fa] px-5">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Create Account</h1>
                        <p className="text-gray-500 font-medium">Join us for a delicious experience</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <label className="block text-gray-700 font-bold text-sm ml-1">Full Name:</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-gray-700 font-bold text-sm ml-1">Email Address:</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Enter your Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-gray-700 font-bold text-sm ml-1">Phone Number:</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    placeholder="Enter your phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-gray-700 font-bold text-sm ml-1">Address:</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-[22px] -translate-y-1/2 text-gray-400" />
                                <textarea
                                    name="address"
                                    required
                                    placeholder="Enter your address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium resize-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-gray-700 font-bold text-sm ml-1">Password:</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="Enter your Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-gray-700 font-bold text-sm ml-1">Gender:</label>
                            <select
                                name="gender"
                                required
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all font-medium appearance-none"
                            >
                                <option value="" disabled>Select your gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#E53935] text-white font-bold rounded-2xl hover:bg-[#C62828] transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 group"
                        >
                            {loading ? 'Creating account...' : (
                                <>
                                    Create Account
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#E53935] font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
