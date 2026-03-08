import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Image as ImageIcon, ShoppingBag, Calendar, MessageSquare, LogOut, Menu, X, User, Settings as SettingsIcon, UserCheck, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { admin, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => setIsMobileMenuOpen(false), [location]);

    const navLinks = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/orders', icon: ShoppingBag, label: 'Manage Orders' },
        { to: '/admin/reservations', icon: Calendar, label: 'Table Reservations' },
        { to: '/admin/dishes', icon: UtensilsCrossed, label: 'Menu Items' },
        { to: '/admin/posters', icon: ImageIcon, label: 'Promotions' },
        admin?.isMainAdmin && { to: '/admin/settings', icon: SettingsIcon, label: 'Settings' },
        admin?.isMainAdmin && { to: '/admin/delivery-boys', icon: User, label: 'Delivery Boys' },
        admin?.isMainAdmin && { to: '/admin/requests', icon: UserCheck, label: 'Approval Requests' },
        admin?.isMainAdmin && { to: '/admin/staff', icon: Users, label: 'Manage Admin Staff' },
        { to: '/admin/feedback', icon: MessageSquare, label: 'Customer Feedback' },
    ].filter(Boolean);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row font-sans">

            {/* Mobile Topbar */}
            <div className="md:hidden bg-[#E53935] text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
                <Link to="/admin/dashboard" className="text-xl font-black">KHN CHN Admin</Link>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 h-screen md:h-screen w-72 bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 z-40 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>

                {/* Brand */}
                <div className="p-6 border-b border-gray-100 hidden md:block">
                    <Link to="/admin/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E53935] rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                            <UtensilsCrossed size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">KHN CHN</h2>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 block">Admin Portal</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {navLinks.map(({ to, icon: Icon, label }) => {
                        const isActive = location.pathname.startsWith(to);
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${isActive
                                    ? 'bg-red-50 text-[#E53935] shadow-sm ring-1 ring-red-100'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? "text-[#E53935]" : "text-gray-400"} />
                                {label}
                            </Link>
                        );
                    })}
                </div>

                {/* User Card */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200 mb-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                            <User size={18} className="text-gray-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{admin?.isMainAdmin ? 'Main Admin' : 'Admin'}</p>
                            <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-x-hidden p-4 md:p-8 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
