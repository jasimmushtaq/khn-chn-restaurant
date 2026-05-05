import { useState, useEffect } from 'react';
import { ShoppingBag, Truck, CheckCircle, Clock, User, Phone, MapPin, X, Receipt, ShoppingCart, Ban, AlertCircle } from 'lucide-react';
import { getAllOrders, updateOrderStatus, adminCancelOrder, getAllDeliveryBoys } from '../../services/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedBoyId, setSelectedBoyId] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        fetchOrders();
        fetchDeliveryBoys();
    }, []);

    const fetchDeliveryBoys = async () => {
        try {
            const { data } = await getAllDeliveryBoys();
            setDeliveryBoys(data.boys || []);
        } catch (e) {
            console.error('Failed to load delivery boys', e);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await getAllOrders();
            setOrders(res.data.orders);
        } catch (err) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus, boyId = null) => {
        try {
            await updateOrderStatus(id, newStatus, boyId);
            toast.success('Order status updated!');
            if (selectedOrder && selectedOrder._id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            fetchOrders();
            setSelectedBoyId('');
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleAdminCancel = async (e) => {
        e.preventDefault();
        if (!cancelReason.trim()) return toast.error('Please provide a reason');

        try {
            setIsCancelling(true);
            await adminCancelOrder(selectedOrder._id, cancelReason);
            toast.success('Order cancelled by admin');

            const updatedOrder = { ...selectedOrder, status: 'cancelled', cancellationReason: cancelReason };
            setSelectedOrder(updatedOrder);
            setCancelReason('');
            fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-red-100 border-t-[#E53935] rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <ShoppingBag size={24} className="text-[#E53935]" />
                            Live Orders
                        </h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">Manage food delivery pipeline in real-time</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{orders.length} Active</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-[0.15em] text-[10px]">
                            <tr>
                                <th className="px-8 py-5">Order ID</th>
                                <th className="px-8 py-5">Customer</th>
                                <th className="px-8 py-5">Value</th>
                                <th className="px-8 py-5">Area</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-20">
                                        <ShoppingCart size={40} className="mx-auto text-gray-200 mb-2" />
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No orders yet.</p>
                                    </td>
                                </tr>
                            ) : orders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-gray-900">#{order._id.slice(-6).toUpperCase()}</div>
                                        <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-left group/btn"
                                        >
                                            <div className="font-bold text-gray-900 group-hover/btn:text-[#E53935] transition-colors">{order.customer.name}</div>
                                            <div className="text-xs text-gray-500 font-medium">{order.customer.phone}</div>
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-[#E53935] text-lg">₹{order.totalAmount.toFixed(0)}</div>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <div className="text-[9px] font-black tracking-tighter uppercase text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded inline-block w-fit">
                                                {order.paymentMethod || (order.transactionId === 'CASH ON DELIVERY' ? 'COD' : 'Online')}
                                            </div>
                                            <div className={`text-[8px] font-black tracking-tighter uppercase px-1.5 py-0.5 rounded inline-block w-fit ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                {order.paymentStatus || 'Pending'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-gray-700">{order.area || 'General'}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${order.status === 'received' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                            order.status === 'preparing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                order.status === 'delivering' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                    'bg-green-50 text-green-600 border-green-100'
                                            } ${order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' : ''}`}>
                                            {order.status === 'received' && <Clock size={10} />}
                                            {order.status === 'preparing' && <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />}
                                            {order.status === 'delivering' && <Truck size={10} />}
                                            {order.status === 'delivered' && <CheckCircle size={10} />}
                                            {order.status === 'cancelled' && <Ban size={10} />}
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="px-4 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#E53935] transition-all transform group-hover:scale-105 active:scale-95 shadow-lg shadow-gray-200"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-scale-up">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col md:flex-row h-full">
                            {/* Left: Order Info */}
                            <div className="flex-1 p-8 md:p-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#E53935]">
                                        <Receipt size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">Order Details</h3>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">#{selectedOrder._id.toUpperCase()}</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Customer Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100 hover:border-red-100 transition-colors">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</h4>
                                                <p className="font-bold text-gray-900">{selectedOrder.customer.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                                                <Phone size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact</h4>
                                                <p className="font-black text-lg text-gray-900">{selectedOrder.customer.phone}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Area</h4>
                                                <p className="font-bold text-gray-900">{selectedOrder.area || 'General'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 rounded-3xl bg-gray-50 border border-gray-100">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Address</h4>
                                                <p className="text-sm font-medium text-gray-600 leading-relaxed">{selectedOrder.customer.address}</p>
                                            </div>
                                        </div>

                                        {/* Delivery Partner Info */}
                                        <div className="flex items-start gap-4 p-4 rounded-3xl bg-gray-50 border border-dotted border-gray-300">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#E53935] border border-gray-100">
                                                <Truck size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assignee</h4>
                                                <p className="font-bold text-gray-900">
                                                    {selectedOrder.deliveryPartner ? selectedOrder.deliveryPartner.name : 'Unassigned'}
                                                </p>
                                                {selectedOrder.deliveryPartner && (
                                                    <span className="text-[9px] font-black text-green-600 uppercase">Verified Profile Attached</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' ? (
                                            <>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Update Order Status</h4>
                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                     <select
                                                         value={selectedOrder.status}
                                                         onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                                                         className="col-span-1 bg-gray-50 border-none px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-red-100 transition-all appearance-none cursor-pointer"
                                                     >
                                                         <option value="received">Received</option>
                                                         <option value="preparing">Preparing</option>
                                                         <option value="delivering">Delivering</option>
                                                     </select>
                                                     <button
                                                         onClick={() => handleStatusChange(selectedOrder._id, 'delivered')}
                                                         className="col-span-1 bg-[#E53935] hover:bg-black text-white px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-100 active:scale-95"
                                                     >
                                                         Deliver Now
                                                     </button>
                                                 </div>

                                                 {!selectedOrder.deliveryPartner && (
                                                     <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 mb-6">
                                                         <div className="flex items-center gap-2 mb-3">
                                                             <Truck size={14} className="text-blue-500" />
                                                             <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Assign Delivery Partner</h4>
                                                         </div>
                                                         <div className="flex gap-2">
                                                             <select
                                                                 value={selectedBoyId}
                                                                 onChange={(e) => setSelectedBoyId(e.target.value)}
                                                                 className="flex-1 bg-white border border-blue-100 px-4 py-3 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-200 outline-none"
                                                             >
                                                                 <option value="">Select a partner...</option>
                                                                 {deliveryBoys.map(boy => (
                                                                     <option key={boy._id} value={boy._id}>
                                                                         {boy.name} {!boy.photoUrl ? '(No Photo)' : ''}
                                                                     </option>
                                                                 ))}
                                                             </select>
                                                             <button
                                                                 onClick={() => handleStatusChange(selectedOrder._id, selectedOrder.status, selectedBoyId)}
                                                                 disabled={!selectedBoyId}
                                                                 className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                             >
                                                                 Assign
                                                             </button>
                                                         </div>
                                                     </div>
                                                 )}

                                                <div className="p-5 bg-red-50/50 rounded-3xl border border-red-100">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Ban size={14} className="text-red-500" />
                                                        <h4 className="text-[10px] font-black text-red-900 uppercase tracking-widest">Admin Cancellation</h4>
                                                    </div>
                                                    <form onSubmit={handleAdminCancel} className="space-y-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Why are you cancelling?"
                                                            value={cancelReason}
                                                            onChange={(e) => setCancelReason(e.target.value)}
                                                            className="w-full bg-white border border-red-100 px-4 py-3 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-red-200 outline-none"
                                                        />
                                                        <button
                                                            disabled={isCancelling}
                                                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                                                        >
                                                            {isCancelling ? 'Processing...' : 'Cancel Order'}
                                                        </button>
                                                    </form>
                                                </div>
                                            </>
                                        ) : selectedOrder.status === 'cancelled' ? (
                                            <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Ban size={18} className="text-[#E53935]" />
                                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Order Cancelled</h4>
                                                </div>
                                                <p className="text-xs font-bold text-red-700 uppercase tracking-widest mb-2">Reason for cancellation:</p>
                                                <div className="p-4 bg-white rounded-2xl border border-red-100 text-sm font-medium text-gray-600 italic">
                                                    "{selectedOrder.cancellationReason || 'No reason provided'}"
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100 flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm border border-green-100">
                                                    <CheckCircle size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none mb-1">Delivered</h4>
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">This order is completed</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Items Panel */}
                            <div className="w-full md:w-80 bg-gray-50/50 p-8 md:p-10 border-l border-gray-100 backdrop-blur-sm">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Items Summary</h3>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                <p className="text-[10px] font-black text-[#E53935] uppercase tracking-widest mt-1">QTY: {item.qty}</p>
                                            </div>
                                            <p className="text-xs font-black text-gray-900 ml-4">₹{(item.price * item.qty).toFixed(0)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total</span>
                                        <span className="text-2xl font-black text-[#E53935]">₹{selectedOrder.totalAmount.toFixed(0)}</span>
                                    </div>
                                    <div className="flex flex-col items-end mt-2 gap-1">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${selectedOrder.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                            {selectedOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}
                                        </span>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${selectedOrder.paymentStatus === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                            Status: {selectedOrder.paymentStatus || 'Pending'}
                                        </span>
                                        {selectedOrder.transactionId && selectedOrder.transactionId !== 'CASH ON DELIVERY' && (
                                            <span className="text-[8px] text-gray-400 font-bold">TX: {selectedOrder.transactionId}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scale-up {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-scale-up {
                    animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
            ` }} />
        </div>
    );
};

export default AdminOrders;
