import { useState, useEffect } from "react";
import { getAllDeliveryBoys, updateDeliveryBoy, deleteDeliveryBoy } from "../../services/api";
import toast from "react-hot-toast";
import { Users, Mail, Lock, Save, Edit3, ShieldAlert, Trash2 } from "lucide-react";

const AdminDeliveryBoys = () => {
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ 
        email: '', password: '', name: '', phone: '',
        vehicleType: '', plate: '', photoUrl: '', idVerified: false, bgChecked: false,
        assignedArea: ''
    });

    useEffect(() => {
        fetchDeliveryBoys();
    }, []);

    const fetchDeliveryBoys = async () => {
        try {
            const { data } = await getAllDeliveryBoys();
            setDeliveryBoys(data.boys || []);
        } catch (error) {
            toast.error("Failed to fetch delivery boys");
        } finally {
            setLoading(false);
        }
    };

    const handleEditStart = (boy) => {
        setEditingId(boy._id);
        setEditForm({ 
            email: boy.email, 
            password: '', 
            name: boy.name, 
            phone: boy.phone,
            assignedArea: boy.assignedArea || ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateDeliveryBoy(editingId, editForm);
            toast.success("Delivery boy credentials updated");
            setEditingId(null);
            fetchDeliveryBoys();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update");
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to remove ${name}?`)) {
            try {
                await deleteDeliveryBoy(id);
                toast.success("Delivery boy removed");
                fetchDeliveryBoys();
            } catch (error) {
                toast.error("Failed to remove delivery boy");
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <Users className="text-[#E53935]" size={32} />
                    Delivery Management
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Manage delivery boy accounts and credentials</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Name</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Email</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Area</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-6 py-8">
                                            <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : deliveryBoys.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center">
                                        <ShieldAlert size={48} className="mx-auto text-gray-200 mb-4" />
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No delivery boys found</p>
                                    </td>
                                </tr>
                            ) : deliveryBoys.map((boy) => (
                                <tr key={boy._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{boy.name}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mt-1 w-fit ${boy.isApproved ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100 animate-pulse'}`}>
                                                {boy.isApproved ? 'Approved' : 'Pending Approval'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {editingId === boy._id ? (
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-medium w-full focus:ring-2 focus:ring-red-100"
                                            />
                                        ) : (
                                            <span className="text-gray-600 font-medium">{boy.email}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-gray-600 font-medium">{boy.phone}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        {editingId === boy._id ? (
                                            <input
                                                type="text"
                                                placeholder="Assign Area"
                                                value={editForm.assignedArea}
                                                onChange={(e) => setEditForm({ ...editForm, assignedArea: e.target.value })}
                                                className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm font-medium w-full focus:ring-2 focus:ring-red-100"
                                            />
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="text-gray-600 font-medium">{boy.assignedArea || 'General'}</span>
                                                {boy.isBusy && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full w-fit mt-1">Busy</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        {editingId === boy._id ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="relative">
                                                    <Lock size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="password"
                                                        placeholder="New Password"
                                                        value={editForm.password}
                                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                                        className="bg-gray-50 border-none rounded-lg pl-7 pr-3 py-2 text-sm font-medium w-full focus:ring-2 focus:ring-red-100 placeholder:text-gray-300"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleUpdate}
                                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <Save size={12} /> Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {!boy.isApproved && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await updateDeliveryBoy(boy._id, { isApproved: true });
                                                                toast.success(`${boy.name} Approved`);
                                                                fetchDeliveryBoys();
                                                            } catch (e) { toast.error("Approval failed"); }
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEditStart(boy)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 hover:text-black transition-all group"
                                                >
                                                    <Edit3 size={14} className="group-hover:scale-110 transition-transform" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(boy._id, boy.name)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-[#E53935] hover:text-white transition-all group"
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

            <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2rem] flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm flex-shrink-0">
                    <ShieldAlert size={24} />
                </div>
                <div>
                    <h3 className="text-orange-900 font-black uppercase tracking-tight text-sm mb-1">Security Note</h3>
                    <p className="text-orange-700 text-xs font-medium leading-relaxed">
                        Updating a delivery boy's email or password will take effect immediately.
                        The delivery boy may need to log out and log back in on their device to sync the changes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDeliveryBoys;
