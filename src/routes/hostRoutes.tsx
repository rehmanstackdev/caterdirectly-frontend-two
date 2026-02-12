
import { Route, Routes, Navigate } from 'react-router-dom';
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import EventHostDashboard from '../pages/EventHostDashboard';
import EventHostAnalytics from '../pages/EventHostAnalytics';
import GuestDatabasePage from '../pages/GuestDatabasePage';
import HostEarningsPage from '../pages/HostEarningsPage';
import EventHostSupport from '../pages/EventHostSupport';
import EventHostProfile from '../pages/EventHostProfile';
import HostOrdersPage from '../pages/host/HostOrdersPage';
import OrderDetailsPage from '../pages/host/OrderDetailsPage';
import NotFound from '../pages/NotFound';
import HostReviewsPage from '../pages/host/HostReviewsPage';
import HostOrderSummaryPage from '../pages/HostOrderSummaryPage';
import HostOrderConfirmationPage from '../pages/HostOrderConfirmationPage';

const HostRoutes = (
  <Route path="/host/*" element={
    <ProtectedRoute userRole="host">
      <Routes>
        <Route path="dashboard" element={<EventHostDashboard />} />
        <Route path="analytics" element={<EventHostAnalytics />} />
        <Route path="guests" element={<GuestDatabasePage />} />
        <Route path="earnings" element={<HostEarningsPage />} />
        <Route path="support" element={<EventHostSupport />} />
        <Route path="profile" element={<EventHostProfile />} />
        <Route path="orders" element={<Navigate to="/host/analytics?section=orders" replace />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="order-summary/:id" element={<HostOrderSummaryPage />} />
        <Route path="order-confirmation" element={<HostOrderConfirmationPage />} />
        <Route path="reviews" element={<Navigate to="/host/analytics?section=orders" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ProtectedRoute>
  } />
);

export default HostRoutes;
