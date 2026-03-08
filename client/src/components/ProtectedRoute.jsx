import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireMainAdmin = false }) => {
    const { isAuthenticated, admin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#c8963e]/30 border-t-[#c8963e] rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[#9ca3af] text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    if (requireMainAdmin && !admin?.isMainAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
