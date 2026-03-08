import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Search, AlertCircle } from 'lucide-react';
import { getAllDishes, createDish, updateDish, deleteDish } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'Starters', 'Main Course (Veg)', 'Main Course (Non Veg)', 'Chicken',
    'Wraps', 'Tandoori (Veg)', 'Tandoori (Non Veg)', 'Rice Section',
    'Hot Soups', 'Momos', 'Salad', 'Noodles', 'Meals', 'Indian Breads',
    'Non Veg Pizza', 'Veg Pizza', 'Non Veg Burger', 'Veg Burger',
    'Chicken Popcorn', 'Boneless Strips', 'Hot Wings', 'Pasta',
    'Seafood', 'Desserts', 'Beverages'
];

const initialForm = { name: '', description: '', price: '', category: 'Main Course (Veg)' };

const AdminDishes = () => {
    const [dishes, setDishes] = useState([]);
    const [filteredDishes, setFilteredDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editDish, setEditDish] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const fileRef = useRef();

    const fetchDishes = async () => {
        setLoading(true);
        try {
            const res = await getAllDishes();
            setDishes(res.data.dishes);
            setFilteredDishes(res.data.dishes);
        } catch (err) {
            toast.error('Failed to load dishes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDishes();
    }, []);

    useEffect(() => {
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            setFilteredDishes(dishes.filter(d =>
                d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
            ));
        } else {
            setFilteredDishes(dishes);
        }
    }, [searchQuery, dishes]);

    const openAddModal = () => {
        setEditDish(null);
        setForm(initialForm);
        setImageFile(null);
        setImagePreview('');
        setShowModal(true);
    };

    const openEditModal = (dish) => {
        setEditDish(dish);
        setForm({
            name: dish.name,
            description: dish.description,
            price: dish.price.toString(),
            category: dish.category,
        });
        setImageFile(null);
        setImagePreview(dish.image);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditDish(null);
        setForm(initialForm);
        setImageFile(null);
        setImagePreview('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.description || !form.price) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (!editDish && !imageFile) {
            toast.error('Please select a dish image');
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('price', form.price);
        formData.append('category', form.category);
        if (imageFile) formData.append('image', imageFile);

        try {
            if (editDish) {
                await updateDish(editDish._id, formData);
                toast.success('Dish updated successfully!', {
                    style: { background: '#1a1a2e', color: '#f0f0f0', border: '1px solid rgba(200,150,62,0.3)' },
                });
            } else {
                await createDish(formData);
                toast.success('Dish added successfully!', {
                    style: { background: '#1a1a2e', color: '#f0f0f0', border: '1px solid rgba(200,150,62,0.3)' },
                });
            }
            closeModal();
            fetchDishes();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDish(id);
            toast.success('Dish deleted successfully');
            setDeleteConfirm(null);
            fetchDishes();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete dish');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-1">
                        Manage <span className="gold-text">Dishes</span>
                    </h1>
                    <p className="text-[#9ca3af] text-sm">{dishes.length} dishes in your menu</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#c8963e] to-[#a67830] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#c8963e]/30 hover:scale-[1.02] transition-all"
                >
                    <Plus size={18} />
                    Add New Dish
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md pl-11 pr-4 py-3 bg-[#16213e] border border-[rgba(200,150,62,0.2)] rounded-xl text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#c8963e] transition-colors"
                />
            </div>

            {/* Dishes Table */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 glass-card shimmer" />
                    ))}
                </div>
            ) : filteredDishes.length > 0 ? (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[rgba(200,150,62,0.1)]">
                                    <th className="text-left text-[#9ca3af] text-xs uppercase tracking-wider px-6 py-4">Dish</th>
                                    <th className="text-left text-[#9ca3af] text-xs uppercase tracking-wider px-6 py-4 hidden md:table-cell">Category</th>
                                    <th className="text-left text-[#9ca3af] text-xs uppercase tracking-wider px-6 py-4">Price</th>
                                    <th className="text-left text-[#9ca3af] text-xs uppercase tracking-wider px-6 py-4 hidden sm:table-cell">Status</th>
                                    <th className="text-right text-[#9ca3af] text-xs uppercase tracking-wider px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[rgba(200,150,62,0.05)]">
                                {filteredDishes.map((dish) => (
                                    <tr key={dish._id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={dish.image}
                                                    alt={dish.name}
                                                    className="w-12 h-12 rounded-lg object-cover border border-[rgba(200,150,62,0.2)] flex-shrink-0"
                                                />
                                                <div>
                                                    <p className="text-white font-medium text-sm">{dish.name}</p>
                                                    <p className="text-[#9ca3af] text-xs line-clamp-1 max-w-xs hidden sm:block">{dish.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="px-3 py-1 text-xs rounded-full bg-[rgba(200,150,62,0.1)] text-[#c8963e] border border-[rgba(200,150,62,0.2)]">
                                                {dish.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[#c8963e] font-bold">₹{parseFloat(dish.price).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${dish.isAvailable
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {dish.isAvailable ? '● Available' : '● Unavailable'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(dish)}
                                                    className="w-9 h-9 rounded-lg bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] text-indigo-400 hover:bg-[rgba(99,102,241,0.2)] transition-all flex items-center justify-center"
                                                    title="Edit dish"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(dish)}
                                                    className="w-9 h-9 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-red-400 hover:bg-[rgba(239,68,68,0.2)] transition-all flex items-center justify-center"
                                                    title="Delete dish"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 glass-card">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-xl font-semibold text-white mb-2 font-serif">No dishes found</h3>
                    <p className="text-[#9ca3af] mb-6">{searchQuery ? 'Try a different search' : 'Start by adding your first dish!'}</p>
                    {!searchQuery && (
                        <button
                            onClick={openAddModal}
                            className="px-6 py-3 bg-gradient-to-r from-[#c8963e] to-[#a67830] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#c8963e]/30 transition-all"
                        >
                            Add First Dish
                        </button>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative z-10 w-full max-w-lg glass-card p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white font-serif">
                                {editDish ? 'Edit Dish' : 'Add New Dish'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="w-8 h-8 rounded-lg bg-white/5 text-[#9ca3af] hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-[#9ca3af] text-sm mb-2">
                                    Dish Image {!editDish && <span className="text-[#c8963e]">*</span>}
                                </label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all hover:border-[#c8963e] ${imagePreview ? 'border-[rgba(200,150,62,0.4)]' : 'border-[rgba(200,150,62,0.2)]'
                                        }`}
                                >
                                    {imagePreview ? (
                                        <div className="relative aspect-video">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <p className="text-white text-sm font-medium">Click to change image</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-10 flex flex-col items-center gap-3 text-[#9ca3af]">
                                            <Upload size={32} className="text-[#c8963e]" />
                                            <p className="text-sm">Click to upload dish image</p>
                                            <p className="text-xs text-[#9ca3af]/60">JPEG, PNG, WebP up to 10MB</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-[#9ca3af] text-sm mb-2">
                                    Dish Name <span className="text-[#c8963e]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Grilled Salmon"
                                    required
                                    className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#c8963e] transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[#9ca3af] text-sm mb-2">
                                    Description <span className="text-[#c8963e]">*</span>
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe the dish, ingredients, flavors..."
                                    rows={3}
                                    required
                                    className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#c8963e] transition-colors resize-none"
                                />
                            </div>

                            {/* Price + Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[#9ca3af] text-sm mb-2">
                                        Price (₹) <span className="text-[#c8963e]">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#c8963e] transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#9ca3af] text-sm mb-2">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white focus:outline-none focus:border-[#c8963e] transition-colors appearance-none cursor-pointer"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-3 border border-[rgba(200,150,62,0.2)] text-[#9ca3af] rounded-xl hover:border-[rgba(200,150,62,0.4)] hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-gradient-to-r from-[#c8963e] to-[#a67830] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#c8963e]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {editDish ? 'Updating...' : 'Adding...'}
                                        </div>
                                    ) : (
                                        editDish ? 'Update Dish' : 'Add Dish'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                    <div className="relative z-10 w-full max-w-sm glass-card p-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={28} className="text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 font-serif">Delete Dish?</h3>
                        <p className="text-[#9ca3af] text-sm mb-6">
                            Are you sure you want to delete <strong className="text-white">"{deleteConfirm.name}"</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-3 border border-[rgba(200,150,62,0.2)] text-[#9ca3af] rounded-xl hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm._id)}
                                className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDishes;
