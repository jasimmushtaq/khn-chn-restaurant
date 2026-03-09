import { useState, useEffect } from 'react';
import { getSettings, updateSettings, BASE_URL } from '../../services/api';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Upload, CheckCircle } from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [orderQrFile, setOrderQrFile] = useState(null);
    const [orderQrPreview, setOrderQrPreview] = useState(null);

    const [cancelQrFile, setCancelQrFile] = useState(null);
    const [cancelQrPreview, setCancelQrPreview] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await getSettings();
            setSettings(data.settings);
            setOrderQrPreview(data.settings.orderQrCode);
            setCancelQrPreview(data.settings.cancelQrCode);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleOrderQrChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setOrderQrFile(file);
            setOrderQrPreview(URL.createObjectURL(file));
        }
    };

    const handleCancelQrChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCancelQrFile(file);
            setCancelQrPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            if (orderQrFile) formData.append('orderQrCode', orderQrFile);
            if (cancelQrFile) formData.append('cancelQrCode', cancelQrFile);

            const { data } = await updateSettings(formData);
            setSettings(data.settings);
            toast.success('Settings updated successfully');
            setOrderQrFile(null);
            setCancelQrFile(null);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading settings...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <SettingsIcon className="text-[#E53935]" size={32} />
                    Platform Settings
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Configure global application settings and payment QR codes</p>
            </div>

            {/* QR Code Settings Section */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Payment QR Codes</h2>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                    {/* Order Payment QR */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Order Payment QR (UPI)</label>
                        <p className="text-sm text-gray-500 mb-4">Displayed on the checkout page for regular payments.</p>

                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:border-red-300 transition-colors group relative overflow-hidden">
                            {orderQrPreview ? (
                                <img src={orderQrPreview?.startsWith('blob:') || orderQrPreview?.startsWith('http') ? orderQrPreview : `${BASE_URL}${orderQrPreview}`} alt="Order QR Preview" className="w-48 h-48 object-contain mb-4 rounded-xl mix-blend-multiply" />
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-400 font-medium">
                                    No QR set
                                </div>
                            )}

                            <label className="cursor-pointer bg-white px-5 py-2.5 border border-gray-200 rounded-xl shadow-sm text-gray-700 font-semibold hover:bg-gray-50 hover:text-[#E53935] flex items-center gap-2 transition-all">
                                <Upload size={18} />
                                Upload New QR
                                <input type="file" accept="image/*" className="hidden" onChange={handleOrderQrChange} />
                            </label>
                        </div>
                    </div>

                    {/* Cancellation Fine QR */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Cancellation Fine QR (₹5)</label>
                        <p className="text-sm text-gray-500 mb-4">Displayed when a customer attempts to cancel their order.</p>

                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:border-red-300 transition-colors group relative overflow-hidden">
                            {cancelQrPreview ? (
                                <img src={cancelQrPreview?.startsWith('blob:') || cancelQrPreview?.startsWith('http') ? cancelQrPreview : `${BASE_URL}${cancelQrPreview}`} alt="Cancellation QR Preview" className="w-48 h-48 object-contain mb-4 rounded-xl mix-blend-multiply" />
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-400 font-medium">
                                    No QR set
                                </div>
                            )}

                            <label className="cursor-pointer bg-white px-5 py-2.5 border border-gray-200 rounded-xl shadow-sm text-gray-700 font-semibold hover:bg-gray-50 hover:text-[#E53935] flex items-center gap-2 transition-all">
                                <Upload size={18} />
                                Upload New QR
                                <input type="file" accept="image/*" className="hidden" onChange={handleCancelQrChange} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-10 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving || (!orderQrFile && !cancelQrFile)}
                        className="flex items-center gap-2 px-8 py-4 bg-[#E53935] text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(229,57,53,0.25)] hover:shadow-[0_12px_24px_rgba(229,57,53,0.35)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            <CheckCircle size={20} />
                        )}
                        {saving ? 'Saving Changes...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
