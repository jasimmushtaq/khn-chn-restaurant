import { useState } from 'react';
import { ChefHat, Calendar, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createReservation } from '../services/api';
import toast from 'react-hot-toast';

const ReservationPage = () => {
    const [form, setForm] = useState({ name: '', phone: '', guests: 2, date: '', time: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createReservation(form);
            setSuccess(true);
            toast.success('Table reserved successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to book table');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-32 flex items-center justify-center px-4">
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Table Reserved!</h1>
                    <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                        Thank you, {form.name}. Your table for {form.guests} is booked for {form.date}. We've sent a confirmation SMS to {form.phone}.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full py-4 bg-[#E53935] text-white font-bold rounded-xl hover:bg-[#C62828] transition-colors shadow-[0_8px_20px_rgba(229,57,53,0.3)]"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-5">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Form */}
                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 order-2 lg:order-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-bl-[100px] pointer-events-none -z-10"></div>

                        <div className="mb-10">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                Secure your <br /><span className="text-[#E53935]">Dining Experience</span>
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full Name"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E53935] transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Contact Number"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E53935] transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 flex items-center gap-1"><Calendar size={16} /> Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E53935] transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 flex items-center gap-1"><Clock size={16} /> Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={form.time}
                                        onChange={e => setForm({ ...form, time: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E53935] transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2 flex items-center gap-1"><Users size={16} /> Guests</label>
                                    <select
                                        value={form.guests}
                                        onChange={e => setForm({ ...form, guests: Number(e.target.value) })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E53935] transition-all font-medium cursor-pointer"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '10+'].map(num => (
                                            <option key={num} value={num === '10+' ? 15 : num}>{num} People</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">Special Request (Optional)</label>
                                <textarea
                                    placeholder="Any dietary restrictions, anniversary..."
                                    rows={2}
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E53935] transition-all font-medium resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-between px-8 py-5 bg-[#E53935] text-white font-bold text-lg rounded-xl hover:shadow-[0_12px_30px_rgba(229,57,53,0.35)] active:scale-[0.98] transition-all disabled:opacity-75 disabled:active:scale-100 mt-2"
                            >
                                <span>{loading ? 'Confirming...' : 'Book Table Now'}</span>
                                <ArrowRight size={24} />
                            </button>
                        </form>
                    </div>

                    {/* Visual Side */}
                    <div className="order-1 lg:order-2 px-5 pb-10 lg:pb-0 text-center lg:text-left">
                        <div className="inline-flex w-20 h-20 items-center justify-center rounded-3xl bg-red-100 text-[#E53935] mb-8 rotate-12 mx-auto lg:mx-0">
                            <ChefHat size={40} />
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-[1.1]">
                            Private dining, <br />
                            <span className="text-[#E53935]">redefined.</span>
                        </h1>
                        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto lg:mx-0">
                            Skip the queue. Book your table in advance and enjoy a premium dining experience at KHN CHN without any hassle.
                        </p>
                        <div className="flex items-center gap-4 justify-center lg:justify-start">
                            <div className="flex -space-x-3">
                                <img className="w-12 h-12 rounded-full border-[3px] border-[#f8f9fa]" src="https://i.pravatar.cc/100?img=1" alt="Face" />
                                <img className="w-12 h-12 rounded-full border-[3px] border-[#f8f9fa]" src="https://i.pravatar.cc/100?img=2" alt="Face" />
                                <img className="w-12 h-12 rounded-full border-[3px] border-[#f8f9fa]" src="https://i.pravatar.cc/100?img=3" alt="Face" />
                            </div>
                            <p className="text-sm font-bold text-gray-600">Join 1,000+ happy diners.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ReservationPage;
