
import { Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import CalendarManagement from '../pages/admin/CalendarManagement';
import UserManagement from '../pages/admin/UserManagement';
import ServiceManagement from '../pages/admin/ServiceManagement';
import OrderManagement from '../pages/admin/OrderManagement';
import ContentManagement from '../pages/admin/ContentManagement';
import FinanceManagement from '../pages/admin/FinanceManagement';
import ReportsAnalytics from '../pages/admin/ReportsAnalytics';
import SupportTools from '../pages/admin/SupportTools';
import SystemConfig from '../pages/admin/SystemConfig';
import SecuritySettings from '../pages/admin/SecuritySettings';
import VendorManagement from '../pages/admin/VendorManagement';
import PendingServicesPage from '../pages/admin/PendingServicesPage';
import ProfilePage from '../pages/admin/ProfilePage';
import CreateVendorService from '../pages/admin/CreateVendorService';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminEditServicePage from '../pages/admin/AdminEditServicePage';
import CreateInvoicePage from '../pages/admin/CreateInvoicePage';
import ServiceDetailsPage from '../pages/admin/ServiceDetailsPage';
import VendorProfilePage from '../pages/admin/VendorProfilePage';
import AdminInvoicePage from '../pages/admin/AdminInvoicePage';
import AdminServiceEditorPage from '../pages/admin/AdminServiceEditorPage';
import LeadManagement from '../pages/admin/LeadManagement';
import InvoiceManagement from '../pages/admin/InvoiceManagement';
import AdminWaitlistPage from '../pages/admin/AdminWaitlistPage';
import PaymentRecoveryPage from '../pages/admin/PaymentRecoveryPage';
import EmailAnalytics from '../pages/admin/EmailAnalytics';
import PermissionManagement from '../pages/admin/PermissionManagement';
import AdminForgotPassword from '../pages/admin/AdminForgotPassword';
import AdminMarketPlace from '../pages/super-admin/AdminMarketPlace';
import AdminBookingFlow from '../pages/super-admin/AdminBookingFlow';
import AdminGroupOrderSetup from '../pages/super-admin/AdminGroupOrderSetup';
import AdminBookingRedirect from '../components/admin/AdminBookingRedirect';
import AdminGroupOrderRedirect from '../components/admin/AdminGroupOrderRedirect';
import AdminMessagingPage from '../pages/admin/AdminMessagingPage';
import AdminInvoiceDetailsPage from '../pages/admin/AdminInvoiceDetailsPage';
import AdminEditInvoicePage from '../pages/admin/AdminEditInvoicePage';
import AdminOrderDetailsPage from '../pages/admin/AdminOrderDetailsPage';
import AdminOrderSummaryPage from '../pages/admin/AdminOrderSummaryPage';
import AdminCalendarPage from '@/pages/super-admin/AdminCalendarPage';

// Unified admin routes with permission-based access
const AdminRoutes = (
  <>
    {/* Admin dashboard and core functionality */}
    <Route path="/admin/dashboard" element={
      <ProtectedRoute userRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    } />
    <Route path="/admin/calendar" element={
      <ProtectedRoute userRole="admin">
        <CalendarManagement />
      </ProtectedRoute>
    } />
        <Route path="/admin/calendar-availbility" element={
      <ProtectedRoute userRole="admin">
        <AdminCalendarPage />
      </ProtectedRoute>
    } />
    <Route path="/admin/leads" element={
      <ProtectedRoute userRole="admin">
        <LeadManagement />
      </ProtectedRoute>
    } />
    <Route path="/admin/waitlist" element={
      <ProtectedRoute userRole="admin">
        <AdminWaitlistPage />
      </ProtectedRoute>
    } />
    <Route path="/admin/users" element={
      <ProtectedRoute userRole="admin">
        <UserManagement />
      </ProtectedRoute>
    } />
    <Route path="/admin/vendors" element={
      <ProtectedRoute userRole="admin">
        <VendorManagement />
      </ProtectedRoute>
    } />
    <Route path="/admin/vendors/:id" element={
      <ProtectedRoute userRole="admin">
        <VendorProfilePage />
      </ProtectedRoute>
    } />
    <Route path="/admin/services" element={
      <ProtectedRoute userRole="admin">
        <ServiceManagement />
      </ProtectedRoute>
    } />
    {/* Route for viewing service details */}
    <Route path="/admin/services/:id" element={
      <ProtectedRoute userRole="admin">
        <ServiceDetailsPage />
      </ProtectedRoute>
    } />
    {/* Route for editing services */}
    <Route path="/admin/services/edit/:id" element={
      <ProtectedRoute userRole="admin">
        <AdminEditServicePage />
      </ProtectedRoute>
    } />
    {/* Route for comprehensive service editor */}
    <Route path="/admin/services/editor/:id" element={
      <ProtectedRoute userRole="admin">
        <AdminServiceEditorPage />
      </ProtectedRoute>
    } />
    {/* Invoice routes */}
    <Route path="/admin/invoices" element={
      <ProtectedRoute userRole="admin">
        <InvoiceManagement />
      </ProtectedRoute>
    } />
    <Route path="/admin/invoices/:id" element={
      <ProtectedRoute userRole="admin">
        <AdminInvoiceDetailsPage />
      </ProtectedRoute>
    } />
    <Route path="/admin/invoices/edit/:id" element={
      <ProtectedRoute userRole="admin">
        <AdminEditInvoicePage />
      </ProtectedRoute>
    } />
    <Route path="/admin/invoices/create" element={
      <ProtectedRoute userRole="admin">
        <CreateInvoicePage />
      </ProtectedRoute>
    } />
    <Route path="/admin/invoices/create/:serviceId" element={
      <ProtectedRoute userRole="admin">
        <CreateInvoicePage />
      </ProtectedRoute>
    } />
    <Route path="/admin/orders/:invoiceId" element={
      <ProtectedRoute userRole="admin">
        <AdminOrderDetailsPage />
      </ProtectedRoute>
    } />
    
    {/* Redirect old proposal URLs to invoices */}
    <Route path="/admin/proposals/*" element={<Navigate to="/admin/invoices" replace />} />
    <Route path="/admin/create-vendor-service" element={
      <ProtectedRoute userRole="admin">
        <CreateVendorService />
      </ProtectedRoute>
    } />
    <Route path="/admin/pending-services" element={
      <ProtectedRoute userRole="admin">
        <PendingServicesPage />
      </ProtectedRoute>
    } />
    <Route path="/admin/orders" element={
      <ProtectedRoute userRole="admin">
        <OrderManagement />
      </ProtectedRoute>
    } />
    <Route path="/admin/messaging" element={
      <ProtectedRoute userRole="admin">
        <AdminMessagingPage />
      </ProtectedRoute>
    } />
    {/* Content route removed - content permission deprecated */}
    <Route path="/admin/content" element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="/admin/finances" element={
      <ProtectedRoute userRole="admin">
        <FinanceManagement />
      </ProtectedRoute>
    } />
    <Route path="/admin/reports" element={
      <ProtectedRoute userRole="admin">
        <ReportsAnalytics />
      </ProtectedRoute>
    } />
    <Route path="/admin/support" element={
      <ProtectedRoute userRole="admin">
        <SupportTools />
      </ProtectedRoute>
    } />
    <Route path="/admin/payment-recovery" element={
      <ProtectedRoute userRole="admin">
        <PaymentRecoveryPage />
      </ProtectedRoute>
    } />
    <Route path="/admin/email-analytics" element={
      <ProtectedRoute userRole="admin">
        <EmailAnalytics />
      </ProtectedRoute>
    } />
    <Route path="/admin/config" element={
      <ProtectedRoute userRole="admin">
        <SystemConfig />
      </ProtectedRoute>
    } />
    <Route path="/admin/security" element={
      <ProtectedRoute userRole="admin">
        <SecuritySettings />
      </ProtectedRoute>
    } />
    <Route path="/admin/permissions" element={
      <ProtectedRoute userRole="admin">
        <PermissionManagement />
      </ProtectedRoute>
    } />
    <Route path="/admin/profile" element={
      <ProtectedRoute userRole="admin">
        <ProfilePage />
      </ProtectedRoute>
    } />
    
    {/* Admin forgot password route - public access */}
    <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
    
    {/* Admin marketplace and booking flow routes */}
    <Route path="/admin/marketplace" element={
      <ProtectedRoute userRole="admin">
        <AdminMarketPlace />
      </ProtectedRoute>
    } />
    <Route path="/admin/booking" element={
      <ProtectedRoute userRole="admin">
        <AdminBookingFlow />
      </ProtectedRoute>
    } />
    <Route path="/admin/group-order/setup" element={
      <ProtectedRoute userRole="admin">
        <AdminGroupOrderSetup />
      </ProtectedRoute>
    } />
    <Route path="/admin/order-summary" element={
      <ProtectedRoute userRole="admin">
        <AdminOrderSummaryPage />
      </ProtectedRoute>
    } />
    <Route path="/admin/order-summary/:id" element={
      <ProtectedRoute userRole="admin">
        <AdminOrderSummaryPage />
      </ProtectedRoute>
    } />
  </>
);

export default AdminRoutes;
