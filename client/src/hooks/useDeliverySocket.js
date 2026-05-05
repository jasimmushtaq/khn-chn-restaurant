import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:5001' : 'https://khn-chn-restaurant-backend.onrender.com';

export const useDeliverySocket = (userId) => {
    const [socket, setSocket] = useState(null);
    const [newOrderRequest, setNewOrderRequest] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const token = localStorage.getItem('deliveryToken');
        const newSocket = io(SOCKET_URL, {
            auth: { token },
            query: { userId, role: 'delivery' }
        });

        newSocket.on('connect', () => {
            console.log('Connected to Delivery Socket');
        });

        newSocket.on('new_order_request', (data) => {
            console.log('New order request received:', data);
            setNewOrderRequest(data);
            // We can also trigger a sound or a persistent notification here
        });

        newSocket.on('order_request_timeout', (data) => {
            console.log('Order request timed out:', data);
            if (newOrderRequest?.orderId === data.orderId) {
                setNewOrderRequest(null);
                toast.error("Order request timed out");
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    const acceptOrder = (orderId) => {
        if (socket) {
            socket.emit('accept_order', { orderId });
            setNewOrderRequest(null);
        }
    };

    const rejectOrder = (orderId) => {
        if (socket) {
            socket.emit('reject_order', { orderId });
            setNewOrderRequest(null);
        }
    };

    return { 
        socket, 
        newOrderRequest, 
        setNewOrderRequest,
        acceptOrder, 
        rejectOrder 
    };
};
