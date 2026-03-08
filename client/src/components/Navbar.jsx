import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, UtensilsCrossed, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { totalItems } = useCart();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/menu', label: 'Menu' },
        { to: '/promotions', label: 'Offers' },
        { to: '/tracker', label: 'Track Order' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white shadow-md border-b border-gray-100'
                : 'bg-white/95 backdrop-blur-md border-b border-gray-100'
                }`}
        >
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-[#E53935] flex items-center justify-center shadow-lg shadow-[#E53935]/30 group-hover:scale-105 transition-all">
                            <UtensilsCrossed size={20} className="text-white absolute transition-transform group-hover:rotate-12" />
                        </div>
                        <div className="leading-[1.1] flex flex-col justify-center pt-1">
                            <span className="block text-2xl font-black tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                <span className="text-gray-900">KH</span><span className="text-[#E53935]">'N</span> <span className="text-gray-900">CH</span><span className="text-[#E53935]">'N</span>
                            </span>
                            <span className="block text-[14px] text-[#c8963e]" style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive", marginTop: "-2px" }}>
                                Cafe & Restaurant
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`relative px-4 py-2 font-medium rounded-lg transition-all duration-200 ${isActive(link.to)
                                    ? 'text-[#E53935] font-semibold bg-red-50'
                                    : 'text-gray-600 hover:text-[#E53935] hover:bg-gray-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right: Order button + Cart */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Cart Button */}
                        <Link
                            to="/orders"
                            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:border-[#E53935] hover:text-[#E53935] hover:bg-red-50 transition-all font-medium group"
                        >
                            <ShoppingBag size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                            <span>Cart</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#E53935] text-white text-[11px] font-bold flex items-center justify-center shadow-md animate-bounce">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {/* Admin Login mapping or Reserve Table depending on needs */}
                        <Link
                            to="/admin/login"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                        >
                            <User size={18} />
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-3">
                        <Link to="/orders" className="relative p-2 text-gray-600 hover:text-[#E53935]">
                            <ShoppingBag size={22} />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#E53935] text-white text-[10px] font-bold flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive(link.to)
                                ? 'bg-red-50 text-[#E53935]'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        to="/admin/login"
                        className="block px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                        Admin Login
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
