import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UtensilsCrossed, Eye, EyeOff, UserPlus, Shield, Truck } from 'lucide-react';
import { registerAdmin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminRegister = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        role: 'delivery'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await registerAdmin({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                phone: formData.phone,
                role: formData.role
            });

            if (formData.role === 'admin') {
                toast.success('Registration successful! Waiting for main admin approval.', {
                    icon: '⏳',
                    duration: 5000
                });
                navigate('/admin/login');
            } else {
                toast.success('Delivery boy registered successfully! You can now login.');
                navigate('/delivery/login');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a] py-12 px-4 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c8963e]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#c8963e]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                <div className="glass-card p-8 shadow-2xl shadow-black/50">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c8963e] to-[#a67830] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#c8963e]/30">
                            <UtensilsCrossed size={28} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white font-serif mb-1">
                            Join <span className="gold-text">Saveur</span>
                        </h1>
                        <p className="text-[#9ca3af] text-sm">Create your staff account</p>
                    </div>

                    {/* Role Selection */}
                    <div className="flex gap-4 mb-8">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'admin' })}
                            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${formData.role === 'admin' ? 'bg-[#c8963e]/10 border-[#c8963e] text-[#c8963e]' : 'bg-[#0d0d1a] border-gray-800 text-gray-400 hover:border-gray-700'}`}
                        >
                            <Shield size={24} />
                            <span className="text-xs font-bold uppercase tracking-widest">Admin</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'delivery' })}
                            className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${formData.role === 'delivery' ? 'bg-[#c8963e]/10 border-[#c8963e] text-[#c8963e]' : 'bg-[#0d0d1a] border-gray-800 text-gray-400 hover:border-gray-700'}`}
                        >
                            <Truck size={24} />
                            <span className="text-xs font-bold uppercase tracking-widest">Delivery</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white focus:outline-none focus:border-[#c8963e] transition-colors"
                                />
                            </div>
                            {formData.role === 'delivery' && (
                                <div>
                                    <label className="block text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required={formData.role === 'delivery'}
                                        className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white focus:outline-none focus:border-[#c8963e] transition-colors"
                                    />
                                </div>
                            )}
                            {formData.role === 'delivery' && (
                                <div className="md:col-span-2">
                                    <label className="block text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required={formData.role === 'delivery'}
                                        className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white focus:outline-none focus:border-[#c8963e] transition-colors"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white focus:outline-none focus:border-[#c8963e] transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[#9ca3af] text-[10px] font-black uppercase tracking-widest mb-2">Confirm</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white focus:outline-none focus:border-[#c8963e] transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-[#c8963e] to-[#a67830] text-white font-black rounded-xl hover:shadow-xl hover:shadow-[#c8963e]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-[10px]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                            ) : (
                                `Confirm ${formData.role} Registration`
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center flex flex-col gap-3">
                        <Link to="/admin/login" className="text-gray-500 hover:text-[#c8963e] text-xs transition-colors group">
                            Already have an account? <span className="font-black text-[#c8963e] group-hover:underline ml-1 uppercase tracking-widest text-[10px]">Sign In with full credentials</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;
