import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, User, Phone, MapPin, Camera, Save, ArrowLeft, Shield } from 'lucide-react';
import { getDeliveryProfile, updateDeliveryProfile } from '../../services/api';
import toast from 'react-hot-toast';

const DeliveryProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        vehicleType: '',
        plate: ''
    });
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await getDeliveryProfile();
            setProfile(data.deliveryBoy);
            setFormData({
                name: data.deliveryBoy.name || '',
                phone: data.deliveryBoy.phone || '',
                vehicleType: data.deliveryBoy.vehicleType || '',
                plate: data.deliveryBoy.plate || ''
            });
            if (data.deliveryBoy.photoUrl) {
                setPreview(data.deliveryBoy.photoUrl);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load profile');
            navigate('/delivery/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('phone', formData.phone);
            submitData.append('vehicleType', formData.vehicleType);
            submitData.append('plate', formData.plate);
            
            if (photo) {
                submitData.append('photo', photo);
            }

            const { data } = await updateDeliveryProfile(submitData);
            setProfile(data.deliveryBoy);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#E53935] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-24">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 shadow-sm px-6 py-5 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/delivery/dashboard" className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-black transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-black text-gray-900 tracking-tight uppercase leading-none">
                                My <span className="text-[#E53935]">Profile</span>
                            </h1>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage Settings</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 pt-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Photo Upload Section */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 text-center">
                        <div className="relative inline-block mb-4">
                            <div className="w-32 h-32 rounded-[2rem] bg-gray-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                                {preview ? (
                                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-gray-300" />
                                )}
                            </div>
                            <label className="absolute -bottom-3 -right-3 w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-800 transition-colors">
                                <Camera size={20} />
                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                            </label>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 uppercase">Profile Photo</h2>
                        <p className="text-xs text-gray-500 font-medium mt-1">Required for identity verification</p>
                    </div>

                    {/* Personal Info */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="text-[#E53935]" size={24} />
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Personal Details</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Full Name</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-medium focus:bg-white focus:border-[#E53935] focus:ring-4 focus:ring-red-100 outline-none transition-all"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Phone Number</label>
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-medium focus:bg-white focus:border-[#E53935] focus:ring-4 focus:ring-red-100 outline-none transition-all"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Truck className="text-blue-500" size={24} />
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Vehicle Details</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Vehicle Type</label>
                                <select 
                                    name="vehicleType"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none"
                                >
                                    <option value="" disabled>Select vehicle</option>
                                    <option value="Bicycle">Bicycle</option>
                                    <option value="Motorcycle">Motorcycle</option>
                                    <option value="Scooter">Scooter</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">License Plate / Number</label>
                                <input 
                                    type="text" 
                                    name="plate"
                                    value={formData.plate}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all uppercase"
                                    placeholder="e.g. MH 12 AB 1234"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={saving}
                        className="w-full py-5 bg-[#E53935] text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(229,57,53,0.25)] hover:shadow-[0_12px_24px_rgba(229,57,53,0.35)] hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {saving ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                Save Profile Changes
                            </>
                        )}
                    </button>
                    
                </form>
            </main>
        </div>
    );
};

export default DeliveryProfile;
