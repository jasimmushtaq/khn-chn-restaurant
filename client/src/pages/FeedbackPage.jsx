import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import { createReview } from '../services/api';
import toast from 'react-hot-toast';

const FeedbackPage = () => {
    const [form, setForm] = useState({ name: '', message: '', rating: 5 });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.message) {
            toast.error('Name and message are required.');
            return;
        }
        setLoading(true);
        try {
            await createReview(form);
            setSuccess(true);
            toast.success('Thank you for your feedback!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit feedback');
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
                    <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Got it!</h1>
                    <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                        Thank you for making KHN CHN better! Your review means the world to us and helps us improve every day.
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
        <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-32 flex items-center justify-center px-4">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 max-w-lg w-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-bl-[100px] pointer-events-none -z-10"></div>

                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12">
                        <MessageSquare size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
                        Rate your Delivery
                    </h1>
                    <p className="text-gray-500">We would love to hear your thoughts about KHN CHN.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="text-center">
                        <label className="block text-gray-700 font-bold mb-3">How was the food?</label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setForm({ ...form, rating: star })}
                                    className="p-1 transition-transform hover:scale-110 active:scale-90"
                                >
                                    <Star
                                        size={40}
                                        className={`${form.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'} transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-gray-400 text-sm mt-3 font-semibold uppercase tracking-wider">
                            {['Very Bad', 'Bad', 'Okay', 'Good', 'Excellent!'][form.rating - 1]}
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Your Name</label>
                            <input
                                type="text"
                                required
                                placeholder="Name to display"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 transition-all font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">Write a review</label>
                            <textarea
                                required
                                placeholder="Tell us what you loved..."
                                rows={4}
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-yellow-400 transition-all font-medium resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gray-900 text-white font-bold text-lg rounded-xl hover:bg-black hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-75 disabled:active:scale-100"
                        >
                            {loading ? 'Submitting...' : 'Post Review'}
                        </button>
                        <div className="text-center mt-6">
                            <Link to="/" className="text-gray-500 font-medium hover:text-gray-900 transition-colors">
                                Cancel
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackPage;
