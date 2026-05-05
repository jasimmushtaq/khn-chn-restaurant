import { useState, useEffect } from 'react';
import { getSettings, updateSettings, BASE_URL } from '../../services/api';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, CheckCircle } from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await getSettings();
            setSettings(data.settings);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('upiId', settings.upiId);
            formData.append('upiName', settings.upiName);

            const { data } = await updateSettings(formData);
            setSettings(data.settings);
            toast.success('Settings updated successfully');
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
                    {/* UPI Details */}
                    <div className="col-span-full grid md:grid-cols-2 gap-6 bg-red-50/50 p-6 rounded-3xl border border-red-100">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">UPI ID (VPA)</label>
                            <input
                                type="text"
                                placeholder="e.g. restaurant@upi"
                                value={settings.upiId || ''}
                                onChange={e => setSettings({ ...settings, upiId: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E53935] transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">Display Business Name</label>
                            <input
                                type="text"
                                placeholder="e.g. KHN CHN Restaurant"
                                value={settings.upiName || ''}
                                onChange={e => setSettings({ ...settings, upiName: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E53935] transition-all font-medium"
                            />
                        </div>
                    </div>

                </div>

                {/* Save Button */}
                <div className="mt-10 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
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
