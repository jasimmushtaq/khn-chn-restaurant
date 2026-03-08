import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Eye, EyeOff, LogIn } from 'lucide-react';
import { loginAdmin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const res = await loginAdmin(formData);
            login(res.data.token, res.data.admin);
            toast.success('Welcome back, Admin!', {
                icon: '🎉',
                style: { background: '#1a1a2e', color: '#f0f0f0', border: '1px solid rgba(200,150,62,0.3)' },
            });
            navigate('/admin/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            toast.error(msg, {
                style: { background: '#1a1a2e', color: '#f0f0f0', border: '1px solid rgba(239,68,68,0.4)' },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a] relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c8963e]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#c8963e]/5 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMDAsMTUwLDYyLDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="glass-card p-8 shadow-2xl shadow-black/50">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c8963e] to-[#a67830] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#c8963e]/30">
                            <UtensilsCrossed size={28} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white font-serif mb-1">
                            Admin <span className="gold-text">Portal</span>
                        </h1>
                        <p className="text-[#9ca3af] text-sm">Saveur Restaurant Management</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[#9ca3af] text-sm mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@saveur.com"
                                required
                                className="w-full px-4 py-3.5 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#c8963e] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-[#9ca3af] text-sm mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3.5 pr-12 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#c8963e] transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#c8963e] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#c8963e] to-[#a67830] text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-[#c8963e]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Sign In to Dashboard
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[rgba(200,150,62,0.1)] text-center">
                        <p className="text-[#9ca3af] text-xs">
                            Don't have an account?{' '}
                            <a href="/admin/register" className="text-[#c8963e] hover:underline">Register Admin</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
