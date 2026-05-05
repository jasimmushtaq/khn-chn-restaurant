import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Clock, MapPin, Search } from 'lucide-react';
import { getAllDishes, getAllReviews } from '../services/api';
import DishCard from '../components/DishCard';
import SEO from '../components/SEO';

const HomePage = () => {
    const [dishes, setDishes] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getAllDishes(),
            getAllReviews()
        ])
            .then(([dishesRes, reviewsRes]) => {
                setDishes(dishesRes.data.dishes.slice(0, 6)); // First 6

                const allReviews = reviewsRes.data.reviews;
                setReviews(allReviews.slice(0, 3)); // Top 3

                if (allReviews.length > 0) {
                    const avg = allReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / allReviews.length;
                    setAverageRating(Math.round(avg * 10) / 10);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-20">
            <SEO 
                title="Home | KH'N CH'N"
                description="Experience the best and freshest food in town. Order your favorite dishes online with fast delivery."
            />

            {/* ─── HERO SECTION ─── */}
            <section className="bg-white border-b border-gray-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-24">
                    <div className="flex flex-col md:flex-row items-center gap-12">

                        <div className="flex-1 text-center md:text-left z-10">
                            <span className="inline-block py-1.5 px-4 rounded-full bg-red-50 text-[#E53935] font-semibold text-sm mb-6 border border-red-100">
                                🚀 Delivering Happiness
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-6">
                                Hungry? <br />
                                <span className="text-[#E53935] font-black">We got you.</span>
                            </h1>
                            <p className="text-gray-500 text-lg md:text-xl mb-8 max-w-lg mx-auto md:mx-0">
                                Order food from KHN CHN. Quick delivery, fresh ingredients, and unforgettable flavors straight to your door.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Link to="/menu" className="flex items-center justify-center gap-2 px-8 py-4 bg-[#E53935] hover:bg-[#C62828] text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all hover:-translate-y-1">
                                    Order Now <ChevronRight size={20} />
                                </Link>
                                <Link to="/reservation" className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 font-bold rounded-xl transition-all">
                                    Reserve a Table
                                </Link>
                            </div>

                            {/* Badges */}
                            <div className="mt-12 flex items-center justify-center md:justify-start gap-6 text-sm font-medium text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                        <Clock size={18} />
                                    </div>
                                    <span>~30 Min Delivey</span>
                                </div>
                                {averageRating > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <Star size={18} className="fill-green-600" />
                                        </div>
                                        <span>{averageRating} Rated</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="flex-1 relative">
                            <div className="absolute inset-0 bg-red-500 rounded-full blur-[100px] opacity-20 transform translate-x-10 translate-y-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop"
                                alt="Delicious Food"
                                className="relative z-10 w-full max-w-lg mx-auto rounded-[2.5rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border-4 border-white"
                            />

                            {/* Floating card */}
                            <div className="absolute -left-6 bottom-12 z-20 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 bounce-animation">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">🔥</div>
                                    <div>
                                        <p className="font-bold text-gray-900">Hot & Fresh</p>
                                        <p className="text-xs text-gray-500">Delivered right now</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ─── FEATURED DISHES ─── */}
            <section className="py-16 md:py-24 bg-[#f8f9fa]">
                <div className="max-w-7xl mx-auto px-5 sm:px-8">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Bestsellers in KHN CHN</h2>
                            <p className="text-gray-500">The most loved dishes by our customers.</p>
                        </div>
                        <Link to="/menu" className="hidden sm:flex items-center gap-1 font-semibold text-[#E53935] hover:text-[#C62828] transition-colors">
                            See All <ChevronRight size={18} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 shimmer h-64 border border-gray-100" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dishes.map((dish) => (
                                <DishCard key={dish._id} dish={dish} />
                            ))}
                        </div>
                    )}

                    <div className="mt-8 text-center sm:hidden">
                        <Link to="/menu" className="inline-block px-6 py-3 bg-red-50 text-[#E53935] font-semibold rounded-xl w-full">
                            Explore Full Menu
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── CUSTOMER REVIEWS ─── */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Foodies Say</h2>
                    <p className="text-gray-500 mb-12 max-w-2xl mx-auto">Real reviews from our lovely customers.</p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {reviews.length > 0 ? (
                            reviews.map((r, i) => (
                                <div key={r._id || i} className="bg-[#f8f9fa] p-8 rounded-2xl text-left border border-gray-100 flex flex-col">
                                    <div className="flex text-yellow-500 mb-4">
                                        {[...Array(r.rating || 5)].map((_, j) => <Star key={j} size={18} className="fill-yellow-500" />)}
                                    </div>
                                    <p className="text-gray-700 italic mb-6 flex-grow">"{r.message}"</p>
                                    <div className="font-bold text-gray-900">— {r.name}</div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500">No reviews yet. Be the first to leave one!</div>
                        )}
                    </div>

                    <div className="mt-12">
                        <Link to="/feedback" className="inline-flex items-center font-bold text-gray-600 hover:text-[#E53935] transition-colors gap-2">
                            Leave your feedback <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
