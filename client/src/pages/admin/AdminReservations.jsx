import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { getAllReservations, updateReservationStatus, deleteReservation } from '../../services/api';
import toast from 'react-hot-toast';

const AdminReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const res = await getAllReservations();
            setReservations(res.data.reservations);
        } catch (err) {
            toast.error('Failed to load reservations');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateReservationStatus(id, status);
            toast.success(`Reservation ${status}!`);
            fetchReservations();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this reservation?')) return;
        try {
            await deleteReservation(id);
            toast.success('Reservation deleted');
            fetchReservations();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <div className="text-center py-20 font-bold text-gray-500">Loading Reservations...</div>;

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <Calendar size={20} className="text-[#E53935]" /> Table Reservations
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">Manage all dining bookings</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Guests</th>
                            <th className="px-6 py-4">Notes</th>
                            <th className="px-6 py-4">Status & Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reservations.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-10 text-gray-500 font-medium">No reservations found.</td></tr>
                        ) : reservations.map(res => (
                            <tr key={res._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="font-bold text-gray-900">{res.name}</div>
                                    <div className="text-gray-500">{res.phone}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="font-bold text-gray-900">{res.date}</div>
                                    <div className="text-gray-500">{res.time}</div>
                                </td>
                                <td className="px-6 py-5 font-black text-gray-900 text-base">
                                    {res.guests}
                                </td>
                                <td className="px-6 py-5 max-w-[200px] truncate text-gray-500" title={res.notes}>
                                    {res.notes || '-'}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${res.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                            res.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                            {res.status.toUpperCase()}
                                        </span>

                                        {res.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUpdateStatus(res._id, 'confirmed')} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Confirm">
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button onClick={() => handleUpdateStatus(res._id, 'cancelled')} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Cancel">
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        )}

                                        <button onClick={() => handleDelete(res._id)} className="text-gray-400 hover:text-red-500 text-xs font-bold transition-colors ml-auto underline">
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminReservations;
