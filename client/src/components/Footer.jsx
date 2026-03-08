import { Link } from 'react-router-dom';
import { UtensilsCrossed, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8 mb-16 shadow-none">

                    {/* Brand */}
                    <div className="lg:col-span-1 shadow-none">
                        <Link to="/" className="flex items-center gap-2 mb-6 group">
                            <div className="w-10 h-10 rounded-xl bg-[#E53935] flex items-center justify-center shrink-0">
                                <UtensilsCrossed size={20} className="text-white absolute group-hover:rotate-12 transition-transform" />
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
                        <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-medium">
                            Delivering the best food to your doorstep in 30 minutes. Hot, fresh, and irresistibly delicious.
                        </p>
                        <div className="flex gap-4 mt-6">
                            {[Facebook, Twitter, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#E53935] hover:text-white transition-colors border border-gray-200 hover:border-[#E53935]">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="shadow-none">
                        <h3 className="font-black text-gray-900 mb-6 uppercase tracking-wider text-sm">Help & Support</h3>
                        <ul className="space-y-4 shadow-none">
                            {[
                                { label: 'Track Order', to: '/tracker' },
                                { label: 'Leave Feedback', to: '/feedback' },
                                { label: 'Contact Us', to: '/' },
                            ].map(link => (
                                <li key={link.label} className="shadow-none">
                                    <Link to={link.to} className="text-gray-500 hover:text-[#E53935] font-medium transition-colors">{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="shadow-none">
                        <h3 className="font-black text-gray-900 mb-6 uppercase tracking-wider text-sm">Get in Touch</h3>
                        <ul className="space-y-4 shadow-none">
                            <li className="text-gray-500 text-sm font-medium shadow-none">
                                <span className="block text-gray-400 text-xs uppercase mb-1">Email</span>
                                <a href="mailto:support@khnchn.com" className="hover:text-[#E53935] transition-colors">support@khnchn.com</a>
                            </li>
                            <li className="text-gray-500 text-sm font-medium shadow-none">
                                <span className="block text-gray-400 text-xs uppercase mb-1">Phone</span>
                                <a href="tel:18001234567" className="hover:text-[#E53935] transition-colors">1800 123 4567</a>
                            </li>
                            <li className="text-gray-500 text-sm font-medium shadow-none">
                                <span className="block text-gray-400 text-xs uppercase mb-1">Location</span>
                                123 Baker St, Food City, FC 10020
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 font-medium">
                    <p>© {new Date().getFullYear()} KHN CHN Delivery. All rights reserved.</p>
                    <div className="flex items-center gap-1 mt-4 md:mt-0">
                        Made with <span className="text-red-500 animate-pulse">❤️</span> for food lovers.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
