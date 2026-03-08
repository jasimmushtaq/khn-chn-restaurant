import { useState, useEffect } from "react";
import { getAllAdmins, updateAdminStaff, deleteAdminStaff } from "../../services/api";
import toast from "react-hot-toast";
import { Users, Mail, Lock, Save, Edit3, ShieldAlert, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminStaff = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ email: '', password: '' });
    const { admin } = useAuth();

    useEffect(() => {
        if (admin?.isMainAdmin) {
            fetchAdmins();
        }
    }, [admin]);

    const fetchAdmins = async () => {
        try {
            const { data } = await getAllAdmins();
            setAdmins(data.admins || []);
        } catch (error) {
            const status = error.response?.status;
            const data = error.response?.data;
            const msg = data?.message || error.message || "Network Error";
            console.error("Fetch staff error details:", { status, data, msg });
            toast.error(`Error (${status || 'Network'}): ${msg}`);
        }
        finally {
            setLoading(false);
        }
    };

    const handleEditStart = (admin) => {
        setEditingId(admin._id);
        setEditForm({ email: admin.email, password: '' });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateAdminStaff(editingId, editForm);
            toast.success("Admin credentials updated");
            setEditingId(null);
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update");
        }
    };

    const handleDelete = async (id, email) => {
        if (window.confirm(`Are you sure you want to remove admin ${email}?`)) {
            try {
                await deleteAdminStaff(id);
                toast.success("Admin removed");
                fetchAdmins();
            } catch (error) {
                toast.error("Failed to remove admin");
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <Users className="text-[#E53935]" size={32} />
                    Admin Management
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Manage secondary administrator accounts and staff access</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Email</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="3" className="px-6 py-8">
                                            <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-20 text-center">
                                        <ShieldAlert size={48} className="mx-auto text-gray-200 mb-4" />
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No secondary admins found</p>
                                    </td>
                                </tr>
                            ) : admins.map((admin) => (
                                <tr key={admin._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        {editingId === admin._id ? (
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-medium w-full focus:ring-2 focus:ring-red-100"
                                            />
                                        ) : (
                                            <span className="text-gray-900 font-bold">{admin.email}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block ${admin.isApproved ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                            {admin.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        {editingId === admin._id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="relative w-48">
                                                    <Lock size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="password"
                                                        placeholder="New Password"
                                                        value={editForm.password}
                                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                                        className="bg-gray-50 border-none rounded-lg pl-7 pr-3 py-2 text-sm font-medium w-full focus:ring-2 focus:ring-red-100 placeholder:text-gray-300"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleUpdate}
                                                    className="bg-green-600 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center gap-1"
                                                >
                                                    <Save size={12} /> Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditStart(admin)}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 hover:text-black transition-all group"
                                                >
                                                    <Edit3 size={14} className="group-hover:scale-110 transition-transform" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(admin._id, admin.email)}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E53935] hover:text-white transition-all group"
                                                >
                                                    <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#E53935] shadow-sm flex-shrink-0">
                    <ShieldAlert size={24} />
                </div>
                <div>
                    <h3 className="text-red-900 font-black uppercase tracking-tight text-sm mb-1">Administrator Access Control</h3>
                    <p className="text-red-700 text-xs font-medium leading-relaxed">
                        As the main administrator, you can manage credentials for all other staff members.
                        Changes to an administrator's email or password will take effect immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminStaff;
