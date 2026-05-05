import { useState } from 'react';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Truck, Phone, ArrowRight, ShieldCheck, Timer } from 'lucide-react';

const DeliveryLogin = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        
        // Demo Bypass
        if (phone === '0000000000') {
            toast.success("DEMO MODE: Use OTP 000000");
            setStep('otp');
            return;
        }

        if (!supabase) {
            return toast.error("Supabase is not configured. Please check .env");
        }
        if (!phone || phone.length < 10) {
            return toast.error("Please enter a valid phone number");
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: `+91${phone}`, // Assumed Indian prefix based on previous data
            });

            if (error) throw error;

            toast.success("OTP sent to your phone!");
            setStep('otp');
        } catch (error) {
            toast.error(error.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        // Demo Bypass
        if (phone === '0000000000' && otp === '000000') {
            localStorage.setItem('deliveryToken', 'demo-token');
            toast.success("Demo Login Successful!");
            navigate('/delivery/dashboard');
            return;
        }

        if (!supabase) {
            return toast.error("Supabase is not configured. Please check .env");
        }
        if (!otp || otp.length < 6) {
            return toast.error("Please enter the 6-digit OTP");
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone: `+91${phone}`,
                token: otp,
                type: 'sms',
            });

            if (error) throw error;

            if (data.session) {
                // In a real app, we might need to sync this with our MongoDB backend
                // or ensure the phone exists in our DeliveryBoy collection.
                // For now, we store the session and navigate.
                localStorage.setItem('deliveryToken', data.session.access_token);
                toast.success("Login successful!");
                navigate('/delivery/dashboard');
            }
        } catch (error) {
            toast.error(error.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFEFE] flex items-center justify-center p-6 bg-[radial-gradient(#E53935_0.5px,transparent_0.5px)] [background-size:24px_24px] [background-opacity:0.05]">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 p-10 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full -ml-16 -mb-16 blur-3xl opacity-50" />

                <div className="relative text-center mb-10">
                    <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-black/20">
                        <Truck size={36} className="animate-bounce-subtle" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">
                        Partner <span className="text-[#E53935]">Login</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-3">Secure Access Portal</p>
                </div>

                <form onSubmit={step === 'phone' ? handleSendOTP : handleVerifyOTP} className="space-y-6 relative">
                    {step === 'phone' ? (
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Mobile Number</span>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-gray-100 pr-3">
                                        +91
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="Enter your phone"
                                        className="w-full pl-20 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-[#E53935] focus:bg-white rounded-3xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        required
                                    />
                                </div>
                            </label>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-black text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-[#E53935] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? "Sending..." : "Send OTP"}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <label className="block">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Verification Code</span>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Timer size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="6-digit OTP"
                                        className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-[#E53935] focus:bg-white rounded-3xl outline-none transition-all font-black text-2xl tracking-[0.5em] text-center text-gray-900 placeholder:text-gray-200 placeholder:tracking-normal"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                    />
                                </div>
                            </label>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-[#E53935] text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-red-500/20 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? "Verifying..." : "Verify & Start"}
                                <ShieldCheck size={18} />
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('phone')}
                                className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
                            >
                                Change phone number
                            </button>
                        </div>
                    )}
                </form>

                <div className="mt-12 pt-8 border-t border-gray-50 text-center">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        By logging in, you agree to our <br />
                        <span className="text-gray-400">Service Terms & Safety Policy</span>
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-subtle { animation: bounce-subtle 2s infinite ease-in-out; }
            ` }} />
        </div>
    );
};

export default DeliveryLogin;
