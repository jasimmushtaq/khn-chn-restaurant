import { Navigate, Outlet } from 'react-router-dom';

// Simple protected route for delivery boy using token stored in localStorage
const DeliveryProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('deliveryToken');
    if (!token) {
        return <Navigate to="/delivery/login" replace />;
    }
    return children;
};

export default DeliveryProtectedRoute;
