import { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2 } from 'lucide-react';
import { getAllReviews, deleteReview } from '../../services/api';
import toast from 'react-hot-toast';

const AdminFeedback = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await getAllReviews();
            setReviews(res.data.reviews);
        } catch (err) {
            toast.error('Failed to load feedback');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this feedback?')) return;
        try {
            await deleteReview(id);
            toast.success('Feedback deleted');
            fetchReviews();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <div className="text-center py-20 font-bold text-gray-500">Loading Feedback...</div>;

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <MessageSquare size={20} className="text-[#E53935]" /> Customer Feedback
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">What people are saying</p>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-500 font-medium">No feedback yet.</div>
                ) : reviews.map(review => (
                    <div key={review._id} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 relative group">
                        <button
                            onClick={() => handleDelete(review._id)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={14} />
                        </button>

                        <div className="flex gap-1 mb-4 text-yellow-400">
                            {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} className="fill-yellow-400" />)}
                        </div>
                        <p className="text-gray-700 italic mb-4 leading-relaxed font-medium">"{review.message}"</p>
                        <div className="flex items-center justify-between mt-auto">
                            <span className="font-bold text-gray-900">{review.name}</span>
                            <span className="text-xs text-gray-400 font-bold">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminFeedback;
