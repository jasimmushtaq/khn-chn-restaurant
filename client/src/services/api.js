import axios from 'axios';

const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.hostname.startsWith('192.168');
export const BASE_URL = isLocal ? `http://${window.location.hostname}:5000` : 'https://khn-chn-restaurant-backend.onrender.com';

const API = axios.create({
    baseURL: `${BASE_URL}/api`,
});

// Add JWT token to every request (admin or delivery)
API.interceptors.request.use((config) => {
    const adminToken = localStorage.getItem('adminToken');
    const deliveryToken = localStorage.getItem('deliveryToken');
    const userToken = localStorage.getItem('userToken');
    const token = adminToken || deliveryToken || userToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors globally
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear tokens
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            localStorage.removeItem('deliveryToken');
            localStorage.removeItem('userToken');
            localStorage.removeItem('userInfo');
            
            // Only redirect if not on tracker or home or menu
            const publicPaths = ['/tracker', '/', '/menu', '/promotions'];
            const isPublicPath = publicPaths.some(p => window.location.pathname === p);

            if (!window.location.pathname.includes('login') && !isPublicPath) {
                window.location.href = '/login';
            } else if (isPublicPath) {
                // If they were on a public path, just reload to clear state but stay there
                // window.location.reload(); // Too disruptive? Let's not reload.
            }
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const loginAdmin = (data) => API.post('/auth/login', data);
export const registerAdmin = (data) => API.post('/auth/register', data);
export const getAdminProfile = () => API.get('/auth/profile');
export const getPendingAdmins = () => API.get('/auth/pending-admins');
export const approveAdmin = (id, role) => API.put(`/auth/approve-admin/${id}`, { role });
export const getAllAdmins = () => API.get('/auth/staff');
export const updateAdminStaff = (id, data) => API.put(`/auth/staff/${id}`, data);
export const deleteAdminStaff = (id) => API.delete(`/auth/staff/${id}`);

// Delivery Boy Auth API
export const loginDeliveryBoy = (data) => API.post('/delivery/login', data);
export const getDeliveryProfile = () => API.get('/delivery/profile');
export const updateDeliveryProfile = (formData) => API.put('/delivery/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Dish APIs
export const getAllDishes = (category) =>
    API.get('/dishes', { params: category ? { category } : {} });
export const getDishById = (id) => API.get(`/dishes/${id}`);
export const createDish = (formData) =>
    API.post('/dishes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateDish = (id, formData) =>
    API.put(`/dishes/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteDish = (id) => API.delete(`/dishes/${id}`);

// Poster APIs
export const getAllPosters = () => API.get('/posters');
export const getAllPostersAdmin = () => API.get('/posters/admin/all');
export const createPoster = (formData) =>
    API.post('/posters', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePoster = (id, formData) =>
    API.put(`/posters/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePoster = (id) => API.delete(`/posters/${id}`);

// Order APIs
export const createOrder = (data) => API.post('/orders', data);
export const getAllOrders = () => API.get('/orders');
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);
export const adminCancelOrder = (id, reason) => API.put(`/orders/${id}/admin-cancel`, { reason });
export const deleteOrder = (id) => API.delete(`/orders/${id}`);

// Delivery APIs
export const getDeliveryOrders = () => API.get('/delivery/orders');
export const updateDeliveryOrderStatus = (id, status) => API.put(`/delivery/orders/${id}/status`, { status });
export const updateDeliveryWorkStatus = (workStatus) => API.put('/delivery/status', { workStatus });
export const getAllDeliveryBoys = () => API.get('/admin/deliveryboys');
export const updateDeliveryBoy = (id, data) => API.put(`/admin/deliveryboys/${id}`, data);
export const deleteDeliveryBoy = (id) => API.delete(`/admin/deliveryboys/${id}`);

// Reservation APIs
export const createReservation = (data) => API.post('/reservations', data);
export const getAllReservations = () => API.get('/reservations');
export const updateReservationStatus = (id, status) => API.put(`/reservations/${id}/status`, { status });
export const deleteReservation = (id) => API.delete(`/reservations/${id}`);

// Review APIs
export const createReview = (data) => API.post('/reviews', data);
export const getAllReviews = () => API.get('/reviews');
export const deleteReview = (id) => API.delete(`/reviews/${id}`);

// Settings APIs
export const getSettings = () => API.get('/settings');
export const updateSettings = (formData) => API.put('/settings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Payment APIs
export const createRazorpayOrder = (amount) => API.post('/payment/create-order', { amount });
export const verifyRazorpayPayment = (data) => API.post('/payment/verify-payment', data);
export const createStripeIntent = (amount) => API.post('/payment/stripe/create-intent', { amount });
export const confirmStripePayment = (data) => API.post('/payment/stripe/confirm', data);

// Customer User APIs
export const loginUser = (data) => API.post('/users/login', data);
export const registerUser = (data) => API.post('/users/register', data);
export const getUserProfile = () => API.get('/users/profile');
export const updateUserProfile = (data) => API.put('/users/profile', data);
export const deleteUserProfile = () => API.delete('/users/profile');
export const getUserOrders = () => API.get('/users/orders');

export default API;
