import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import PromotionsPage from './pages/PromotionsPage';
import OrdersPage from './pages/OrdersPage';
import OrderTracking from './pages/OrderTracking';
import ReservationPage from './pages/ReservationPage';
import FeedbackPage from './pages/FeedbackPage';

// Admin Auth
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';

// Admin Portal
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDishes from './pages/admin/AdminDishes';
import AdminPosters from './pages/admin/AdminPosters';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReservations from './pages/admin/AdminReservations';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminSettings from './pages/admin/AdminSettings';
import AdminDeliveryBoys from './pages/admin/AdminDeliveryBoys';
import AdminRequests from './pages/admin/AdminRequests';
import AdminStaff from './pages/admin/AdminStaff';

// Delivery Portal
import DeliveryLogin from './pages/delivery/DeliveryLogin';
import DeliveryOrders from './pages/delivery/DeliveryOrders';
import DeliveryProtectedRoute from './components/DeliveryProtectedRoute';

const PublicPage = ({ children, noFooter }) => (
  <>
    <Navbar />
    {children}
    {!noFooter && <Footer />}
  </>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#fff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicPage><HomePage /></PublicPage>} />
            <Route path="/menu" element={<PublicPage><MenuPage /></PublicPage>} />
            <Route path="/promotions" element={<PublicPage><PromotionsPage /></PublicPage>} />
            <Route path="/orders" element={<PublicPage noFooter><OrdersPage /></PublicPage>} />
            <Route path="/tracker" element={<PublicPage noFooter><OrderTracking /></PublicPage>} />
            <Route path="/reservation" element={<PublicPage noFooter><ReservationPage /></PublicPage>} />
            <Route path="/feedback" element={<PublicPage noFooter><FeedbackPage /></PublicPage>} />

            {/* Admin Auth Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="dishes" element={<AdminDishes />} />
              <Route path="posters" element={<AdminPosters />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="feedback" element={<AdminFeedback />} />
              <Route path="settings" element={<ProtectedRoute requireMainAdmin><AdminSettings /></ProtectedRoute>} />
              <Route path="delivery-boys" element={<ProtectedRoute requireMainAdmin><AdminDeliveryBoys /></ProtectedRoute>} />
              <Route path="requests" element={<ProtectedRoute requireMainAdmin><AdminRequests /></ProtectedRoute>} />
              <Route path="staff" element={<ProtectedRoute requireMainAdmin><AdminStaff /></ProtectedRoute>} />
            </Route>

            {/* Delivery Routes */}
            <Route path="/delivery/login" element={<DeliveryLogin />} />
            <Route
              path="/delivery/orders"
              element={
                <DeliveryProtectedRoute>
                  <DeliveryOrders />
                </DeliveryProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
