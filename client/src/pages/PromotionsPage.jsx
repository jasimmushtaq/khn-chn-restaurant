import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Tag, Sparkles } from 'lucide-react';
import { getAllPosters, BASE_URL } from '../services/api';

const PromotionsPage = () => {
    const [posters, setPosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPoster, setCurrentPoster] = useState(0);

    useEffect(() => {
        const fetchPosters = async () => {
            try {
                const res = await getAllPosters();
                setPosters(res.data.posters);
            } catch (err) {
                console.error('Failed to fetch posters:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosters();
    }, []);

    useEffect(() => {
        if (posters.length > 1) {
            const timer = setInterval(() => {
                setCurrentPoster((prev) => (prev + 1) % posters.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [posters.length]);

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#c8963e]/30 border-t-[#c8963e] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#9ca3af]">Loading promotions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20">
            {/* Header */}
            <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] py-20 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <p className="text-[#c8963e] text-sm uppercase tracking-widest mb-3 font-medium">Limited Time Offers</p>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 font-serif">
                        Special <span className="gold-text">Promotions</span>
                    </h1>
                    <p className="text-[#9ca3af] text-lg max-w-xl mx-auto">
                        Exclusive deals and seasonal specials crafted just for you. Don't miss out!
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                {posters.length > 0 ? (
                    <>
                        {/* Main Slider */}
                        <div className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                            <div
                                className="flex transition-transform duration-700 ease-in-out"
                                style={{ transform: `translateX(-${currentPoster * 100}%)` }}
                            >
                                {posters.map((poster) => (
                                    <div key={poster._id} className="min-w-full relative">
                                        <img
                                            src={poster.image?.startsWith('http') ? poster.image : `${BASE_URL}${poster.image}`}
                                            alt={poster.title}
                                            className="w-full aspect-[16/7] object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-[#0d0d1a]/30 to-transparent" />
                                        <div className="absolute bottom-8 left-8 right-8">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(200,150,62,0.2)] border border-[rgba(200,150,62,0.4)] text-[#c8963e] text-xs mb-3">
                                                <Sparkles size={12} />
                                                Special Offer
                                            </div>
                                            <h2 className="text-3xl md:text-5xl font-bold text-white font-serif mb-2">{poster.title}</h2>
                                            {poster.description && (
                                                <p className="text-[#e8d5b0] text-lg">{poster.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {posters.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentPoster((p) => (p - 1 + posters.length) % posters.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0d0d1a]/80 border border-[rgba(200,150,62,0.3)] text-[#c8963e] flex items-center justify-center hover:bg-[rgba(200,150,62,0.2)] transition-all"
                                    >
                                        <ChevronLeft size={22} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPoster((p) => (p + 1) % posters.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0d0d1a]/80 border border-[rgba(200,150,62,0.3)] text-[#c8963e] flex items-center justify-center hover:bg-[rgba(200,150,62,0.2)] transition-all"
                                    >
                                        <ChevronRight size={22} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* All Promotions Grid */}
                        {posters.length > 1 && (
                            <>
                                <h2 className="text-2xl font-bold text-white mb-8 font-serif">All <span className="gold-text">Promotions</span></h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {posters.map((poster, idx) => (
                                        <div
                                            key={poster._id}
                                            onClick={() => setCurrentPoster(idx)}
                                            className={`glass-card overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#c8963e]/10 ${currentPoster === idx ? 'border-[rgba(200,150,62,0.5)]' : ''
                                                }`}
                                        >
                                            <div className="aspect-video relative overflow-hidden">
                                                <img
                                                    src={poster.image?.startsWith('http') ? poster.image : `${BASE_URL}${poster.image}`}
                                                    alt={poster.title}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/80 to-transparent" />
                                                <div className="absolute top-3 right-3">
                                                    <span className="px-3 py-1 rounded-full text-xs bg-[rgba(200,150,62,0.2)] border border-[rgba(200,150,62,0.4)] text-[#c8963e] flex items-center gap-1">
                                                        <Tag size={10} />
                                                        Special
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-white font-semibold font-serif mb-1">{poster.title}</h3>
                                                {poster.description && (
                                                    <p className="text-[#9ca3af] text-sm line-clamp-2">{poster.description}</p>
                                                )}
                                                <p className="text-[#9ca3af] text-xs mt-2">
                                                    {new Date(poster.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="text-center py-24">
                        <div className="text-7xl mb-6">🎉</div>
                        <h3 className="text-2xl font-semibold text-white mb-2 font-serif">No Promotions Yet</h3>
                        <p className="text-[#9ca3af]">Our team is preparing exciting offers. Stay tuned!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromotionsPage;
