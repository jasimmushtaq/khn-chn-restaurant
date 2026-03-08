import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
});

// Add JWT token to every request (admin or delivery)
API.interceptors.request.use((config) => {
    const adminToken = localStorage.getItem('adminToken');
    const deliveryToken = localStorage.getItem('deliveryToken');
    const token = adminToken || deliveryToken;
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
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            localStorage.removeItem('deliveryToken');
            window.location.href = '/admin/login';
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
export const cancelOrder = (id, cancelTransactionId) => API.put(`/orders/${id}/cancel`, { cancelTransactionId });
export const adminCancelOrder = (id, reason) => API.put(`/orders/${id}/admin-cancel`, { reason });
export const deleteOrder = (id) => API.delete(`/orders/${id}`);

// Delivery APIs
export const getDeliveryOrders = () => API.get('/delivery/orders');
export const updateDeliveryOrderStatus = (id, status) => API.put(`/delivery/orders/${id}/status`, { status });
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

export default API;
