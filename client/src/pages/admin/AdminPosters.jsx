import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getAllPostersAdmin, createPoster, updatePoster, deletePoster, BASE_URL } from '../../services/api';
import toast from 'react-hot-toast';

const initialForm = { title: '', description: '', isActive: true };

const AdminPosters = () => {
    const [posters, setPosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editPoster, setEditPoster] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const fileRef = useRef();

    const fetchPosters = async () => {
        setLoading(true);
        try {
            const res = await getAllPostersAdmin();
            setPosters(res.data.posters);
        } catch (err) {
            toast.error('Failed to load posters');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosters();
    }, []);

    const openAddModal = () => {
        setEditPoster(null);
        setForm(initialForm);
        setImageFile(null);
        setImagePreview('');
        setShowModal(true);
    };

    const openEditModal = (poster) => {
        setEditPoster(poster);
        setForm({ title: poster.title, description: poster.description || '', isActive: poster.isActive });
        setImageFile(null);
        setImagePreview(poster.image);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditPoster(null);
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
        if (!form.title) {
            toast.error('Please enter a poster title');
            return;
        }
        if (!editPoster && !imageFile) {
            toast.error('Please select a poster image');
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('isActive', form.isActive.toString());
        if (imageFile) formData.append('image', imageFile);

        try {
            if (editPoster) {
                await updatePoster(editPoster._id, formData);
                toast.success('Poster updated successfully!', {
                    style: { background: '#1a1a2e', color: '#f0f0f0', border: '1px solid rgba(200,150,62,0.3)' },
                });
            } else {
                await createPoster(formData);
                toast.success('Poster created successfully!', {
                    style: { background: '#1a1a2e', color: '#f0f0f0', border: '1px solid rgba(200,150,62,0.3)' },
                });
            }
            closeModal();
            fetchPosters();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deletePoster(id);
            toast.success('Poster deleted successfully');
            setDeleteConfirm(null);
            fetchPosters();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete poster');
        }
    };

    const handleToggleActive = async (poster) => {
        const formData = new FormData();
        formData.append('title', poster.title);
        formData.append('description', poster.description || '');
        formData.append('isActive', (!poster.isActive).toString());
        try {
            await updatePoster(poster._id, formData);
            toast.success(`Poster ${!poster.isActive ? 'activated' : 'deactivated'}`);
            fetchPosters();
        } catch (err) {
            toast.error('Failed to update poster status');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif mb-1">
                        Manage <span className="gold-text">Posters</span>
                    </h1>
                    <p className="text-[#9ca3af] text-sm">{posters.length} promotional posters</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#c8963e] to-[#a67830] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#c8963e]/30 hover:scale-[1.02] transition-all"
                >
                    <Plus size={18} />
                    Add New Poster
                </button>
            </div>

            {/* Posters Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card overflow-hidden">
                            <div className="aspect-video shimmer" />
                            <div className="p-4 space-y-2">
                                <div className="h-5 shimmer rounded w-3/4" />
                                <div className="h-4 shimmer rounded w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : posters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {posters.map((poster) => (
                        <div key={poster._id} className="glass-card overflow-hidden hover:border-[rgba(200,150,62,0.3)] transition-all duration-300 hover:-translate-y-1">
                            {/* Image */}
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={poster.image?.startsWith('http') ? poster.image : `${BASE_URL}${poster.image}`}
                                    alt={poster.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/60 to-transparent" />
                                {/* Active badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${poster.isActive
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}>
                                        {poster.isActive ? '● Active' : '● Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="text-white font-semibold font-serif mb-1">{poster.title}</h3>
                                {poster.description && (
                                    <p className="text-[#9ca3af] text-sm line-clamp-2 mb-3">{poster.description}</p>
                                )}
                                <p className="text-[#9ca3af] text-xs mb-4">
                                    {new Date(poster.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleActive(poster)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border transition-all ${poster.isActive
                                            ? 'border-red-500/20 text-red-400 hover:bg-red-500/10'
                                            : 'border-green-500/20 text-green-400 hover:bg-green-500/10'
                                            }`}
                                        title={poster.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {poster.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                        {poster.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => openEditModal(poster)}
                                        className="w-9 h-9 rounded-lg bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] text-indigo-400 hover:bg-[rgba(99,102,241,0.2)] transition-all flex items-center justify-center flex-shrink-0"
                                        title="Edit poster"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(poster)}
                                        className="w-9 h-9 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-red-400 hover:bg-[rgba(239,68,68,0.2)] transition-all flex items-center justify-center flex-shrink-0"
                                        title="Delete poster"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 glass-card">
                    <div className="text-6xl mb-4">🖼️</div>
                    <h3 className="text-xl font-semibold text-white mb-2 font-serif">No posters yet</h3>
                    <p className="text-[#9ca3af] mb-6">Create your first promotional poster!</p>
                    <button
                        onClick={openAddModal}
                        className="px-6 py-3 bg-gradient-to-r from-[#c8963e] to-[#a67830] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#c8963e]/30 transition-all"
                    >
                        Add First Poster
                    </button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative z-10 w-full max-w-lg glass-card p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white font-serif">
                                {editPoster ? 'Edit Poster' : 'Add New Poster'}
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
                                    Poster Image {!editPoster && <span className="text-[#c8963e]">*</span>}
                                </label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all hover:border-[#c8963e] ${imagePreview ? 'border-[rgba(200,150,62,0.4)]' : 'border-[rgba(200,150,62,0.2)]'
                                        }`}
                                >
                                    {imagePreview ? (
                                        <div className="relative aspect-video">
                                            <img
                                                src={imagePreview?.startsWith('blob:') || imagePreview?.startsWith('http') ? imagePreview : `${BASE_URL}${imagePreview}`}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <p className="text-white text-sm font-medium">Click to change image</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-10 flex flex-col items-center gap-3 text-[#9ca3af]">
                                            <Upload size={32} className="text-[#c8963e]" />
                                            <p className="text-sm">Click to upload poster image</p>
                                            <p className="text-xs text-[#9ca3af]/60">Wide format images recommended (16:9)</p>
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

                            {/* Title */}
                            <div>
                                <label className="block text-[#9ca3af] text-sm mb-2">
                                    Poster Title <span className="text-[#c8963e]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Weekend Special Offer"
                                    required
                                    className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#c8963e] transition-colors"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[#9ca3af] text-sm mb-2">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Add a promotional message or details..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#0d0d1a] border border-[rgba(200,150,62,0.2)] rounded-xl text-white placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#c8963e] transition-colors resize-none"
                                />
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between p-4 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(200,150,62,0.1)]">
                                <div>
                                    <p className="text-white text-sm font-medium">Active Promotion</p>
                                    <p className="text-[#9ca3af] text-xs">Show this poster on the website</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${form.isActive ? 'bg-[#c8963e]' : 'bg-[#374151]'
                                        }`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${form.isActive ? 'left-7' : 'left-1'
                                        }`} />
                                </button>
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
                                            {editPoster ? 'Updating...' : 'Creating...'}
                                        </div>
                                    ) : (
                                        editPoster ? 'Update Poster' : 'Create Poster'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                    <div className="relative z-10 w-full max-w-sm glass-card p-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={28} className="text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 font-serif">Delete Poster?</h3>
                        <p className="text-[#9ca3af] text-sm mb-6">
                            Are you sure you want to delete <strong className="text-white">"{deleteConfirm.title}"</strong>? This action cannot be undone.
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

export default AdminPosters;
