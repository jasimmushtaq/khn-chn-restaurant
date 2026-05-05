import { useEffect, useState } from 'react';
import { ShoppingBag, MapPin, X, Check, Timer, Navigation } from 'lucide-react';

export const OrderRequestPopup = ({ order, onAccept, onReject }) => {
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (timeLeft <= 0) {
            onReject();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    if (!order) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Timer Bar */}
                <div className="absolute top-0 left-0 h-2 bg-gray-100 w-full">
                    <div 
                        className="h-full bg-[#E53935] transition-all duration-1000 linear" 
                        style={{ width: `${(timeLeft / 30) * 100}%` }}
                    />
                </div>

                <div className="p-10">
                    <div className="flex justify-between items-start mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-[#E53935] shadow-inner">
                                <ShoppingBag size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">New Order</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Instant Request</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-2xl text-xl font-black shadow-lg">
                                <Timer size={18} className="text-[#E53935]" />
                                {timeLeft}s
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 mb-10">
                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                                    <MapPin size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Pick up & Drop</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{order.address}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-8 pl-14">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Distance</p>
                                    <p className="text-lg font-black text-gray-900">2.4 <span className="text-xs text-gray-400">KM</span></p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Est. Earnings</p>
                                    <p className="text-lg font-black text-green-600">₹{Math.round(order.totalAmount * 0.1)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-6">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                                <p className="text-lg font-bold text-gray-900">{order.customerName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Bill Amount</p>
                                <p className="text-2xl font-black text-[#E53935]">₹{order.totalAmount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={onReject}
                            className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                            <X size={18} />
                            Decline
                        </button>
                        <button 
                            onClick={() => onAccept(order.orderId)}
                            className="flex-[2] py-5 bg-[#E53935] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            Accept Order
                        </button>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <Navigation size={10} />
                        Live tracking active upon discovery
                    </p>
                </div>
            </div>
        </div>
    );
};
