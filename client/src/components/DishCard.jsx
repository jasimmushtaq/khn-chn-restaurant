import { useState } from 'react';
import { Star, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BASE_URL } from '../services/api';

const DishCard = ({ dish }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const { addToCart, cartItems, updateQty } = useCart();

    const imageUrl = dish.image?.startsWith('http') ? dish.image : `${BASE_URL}${dish.image}`;

    const cartItem = cartItems.find((item) => item._id === dish._id);
    const qty = cartItem?.qty || 0;

    return (
        <div className="modern-card overflow-hidden flex flex-col group h-full">
            {/* Image Area */}
            <div className="relative h-56 overflow-hidden bg-gray-100 shrink-0">
                {!imageLoaded && <div className="absolute inset-0 shimmer" />}
                <img
                    src={imageUrl}
                    alt={dish.name}
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-700 tracking-wider uppercase shadow-sm">
                    {dish.category || 'Dish'}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-1 bg-white">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
                        {dish.name}
                    </h3>
                    <div className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                        4.8 <Star size={10} className="fill-green-700" />
                    </div>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                    {dish.description}
                </p>

                {/* Footer: Price + Button */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="font-bold text-gray-900 text-xl">
                        ₹{parseFloat(dish.price).toFixed(2)}
                    </div>

                    <div className="relative">
                        {qty === 0 ? (
                            <button
                                onClick={() => addToCart(dish)}
                                className="w-24 py-2 bg-white text-[#E53935] border border-red-200 font-bold text-sm rounded-lg shadow-[0_2px_8px_rgba(229,57,53,0.15)] hover:bg-red-50 hover:shadow-[0_4px_12px_rgba(229,57,53,0.2)] transition-all flex items-center justify-center gap-1 uppercase tracking-wide"
                            >
                                ADD <Plus size={14} className="opacity-80" />
                            </button>
                        ) : (
                            <div className="w-24 h-[38px] flex items-center justify-between bg-[#E53935] text-white rounded-lg font-bold shadow-md shadow-red-500/20 px-2 overflow-hidden transition-all">
                                <button
                                    onClick={() => updateQty(dish._id, qty - 1)}
                                    className="w-6 h-full flex items-center justify-center hover:bg-black/10 active:bg-black/20 transition-colors"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="text-sm font-bold w-6 text-center select-none">{qty}</span>
                                <button
                                    onClick={() => addToCart(dish)}
                                    className="w-6 h-full flex items-center justify-center hover:bg-black/10 active:bg-black/20 transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DishCard;
