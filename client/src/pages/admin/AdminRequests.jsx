import { useState, useEffect } from "react";
import { getPendingAdmins, approveAdmin } from "../../services/api";
import toast from "react-hot-toast";
import { ShieldAlert, UserCheck, Clock, UserX, Mail, Fingerprint } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminRequests = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const { admin } = useAuth();

    useEffect(() => {
        if (admin?.isMainAdmin) {
            fetchPending();
        }
    }, [admin]);

    const fetchPending = async () => {
        try {
            const { data } = await getPendingAdmins();
            setPending(data.pending);
        } catch (error) {
            toast.error("Failed to fetch pending requests");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, role) => {
        try {
            await approveAdmin(id, role);
            toast.success("Account approved successfully");
            fetchPending();
        } catch (error) {
            toast.error("Failed to approve account");
        }
    };

    if (!admin?.isMainAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-red-50/50 rounded-[2.5rem] border border-red-100">
                <ShieldAlert size={64} className="text-[#E53935] mb-4" />
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Access Restricted</h2>
                <p className="text-gray-500 text-sm font-medium mt-2">Only the root administrator can approve other staff members.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <UserCheck className="text-[#E53935]" size={32} />
                    Approval Requests
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Review and authorize new administrator and delivery boy accounts</p>
            </div>

            <div className="grid gap-6">
                {loading ? (
                    [1, 2].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse shadow-sm"></div>)
                ) : pending.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                        <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-black text-gray-900 mb-1 uppercase tracking-tight">No Pending Requests</h3>
                        <p className="text-gray-500 text-sm font-medium">All staff accounts are currently authorized.</p>
                    </div>
                ) : (
                    pending.map((req) => (
                        <div key={req._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-2xl transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                                    <Fingerprint size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Mail size={14} className="text-[#E53935]" />
                                        <span className="font-black text-gray-900 text-lg leading-none">{req.email}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${req.role === 'delivery' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-[#E53935]'}`}>
                                            {req.role}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Registered on {new Date(req.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => handleApprove(req._id, req.role)}
                                    className="flex-1 md:flex-none px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-green-100 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                >
                                    <UserCheck size={16} />
                                    Approve Access
                                </button>
                                <button
                                    className="flex-1 md:flex-none px-8 py-3.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 font-black rounded-2xl transition-all border border-gray-100 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                >
                                    <UserX size={16} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminRequests;
