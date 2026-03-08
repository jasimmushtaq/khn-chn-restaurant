import { useState, useEffect } from 'react';
import { Menu, Search, Filter } from 'lucide-react';
import { getAllDishes } from '../services/api';
import DishCard from '../components/DishCard';
import { useLocation } from 'react-router-dom';

const CATEGORIES = [
    'All', 'Starters', 'Main Course (Veg)', 'Main Course (Non Veg)', 'Chicken',
    'Wraps', 'Tandoori (Veg)', 'Tandoori (Non Veg)', 'Rice Section',
    'Hot Soups', 'Momos', 'Salad', 'Noodles', 'Meals', 'Indian Breads',
    'Non Veg Pizza', 'Veg Pizza', 'Non Veg Burger', 'Veg Burger',
    'Chicken Popcorn', 'Boneless Strips', 'Hot Wings', 'Pasta',
    'Seafood', 'Desserts', 'Beverages'
];

const MenuPage = () => {
    const [dishes, setDishes] = useState([]);
    const [filteredDishes, setFilteredDishes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // To handle scrolling to top
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        getAllDishes()
            .then((res) => {
                setDishes(res.data.dishes);
                setFilteredDishes(res.data.dishes);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = [...dishes];
        if (selectedCategory !== 'All') result = result.filter((d) => d.category === selectedCategory);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
            );
        }
        setFilteredDishes(result);
    }, [dishes, selectedCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-5 sm:px-8">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 sticky top-[80px] bg-[#f8f9fa] z-30 py-4 border-b border-gray-200/60 shadow-sm md:shadow-none md:border-none md:static md:py-0 md:bg-transparent">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Our Menu</h1>
                        <p className="text-gray-500 mt-1">Discover the best food from KHN CHN</p>
                    </div>

                    <div className="relative w-full md:w-96 shadow-sm group">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E53935] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E53935] transition-all"
                        />
                    </div>
                </div>

                {/* Categories (Swiggy horizontal scroll style) */}
                <div className="flex overflow-x-auto no-scrollbar gap-3 mb-12 pb-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${selectedCategory === cat
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shimmer h-80 border border-gray-100" />
                        ))}
                    </div>
                ) : filteredDishes.length > 0 ? (
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <h2 className="text-xl font-bold text-gray-900">{selectedCategory}</h2>
                            <span className="text-gray-400 font-medium">({filteredDishes.length} items)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredDishes.map((dish) => (
                                <DishCard key={dish._id} dish={dish} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-32">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Filter size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No dishes found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery ? `We couldn't find anything matching "${searchQuery}".` : `There are no dishes in ${selectedCategory} yet.`}
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                            className="px-6 py-3 font-bold text-[#E53935] border border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuPage;
