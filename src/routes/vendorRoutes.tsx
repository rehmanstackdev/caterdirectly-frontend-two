
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import VendorDashboardPage from '../pages/vendor/VendorDashboardPage';
import VendorServicesPage from '../pages/vendor/VendorServicesPage';
import VendorOrdersPage from '../pages/vendor/VendorOrdersPage';
import VendorOrderDetailsPage from '../pages/vendor/VendorOrderDetailsPage';
import VendorCalendarPage from '../pages/vendor/VendorCalendarPage';
import VendorMessagesPage from '../pages/vendor/VendorMessagesPage';
import VendorProfilePage from '../pages/vendor/VendorProfilePage';
import VendorInvoicesListPage from '../pages/vendor/VendorInvoicesListPage';
import VendorInvoiceCreatePage from '../pages/vendor/VendorInvoiceCreatePage';
import CreateServicePage from '../pages/vendor/CreateServicePage';
import EditServicePage from '../pages/vendor/EditServicePage';
import ServiceDetailPage from '../pages/vendor/ServiceDetailPage';
import VendorNewInvoicePage from '../pages/vendor/VendorNewInvoicePage';
import VendorTeamPage from '../pages/vendor/VendorTeamPage';
import VendorAnalyticsPage from '../pages/vendor/VendorAnalyticsPage';
import VendorClientManagementPage from '../pages/vendor/VendorClientManagementPage';
import VendorMessagingHub from '../components/vendor/messaging/VendorMessagingHub';
import VendorSupportPage from '../pages/vendor/VendorSupportPage';
import VendorEnhancedSettings from '../components/vendor/settings/VendorEnhancedSettings';
import VendorProposalEditRedirect from '../pages/vendor/VendorInvoiceEditRedirect';
import VendorMarketPlace from '../pages/vendor/VendorMarketPlace';
import VendorBookingFlow from '../pages/vendor/VendorBookingFlow';
import VendorGroupOrderSetup from '../pages/vendor/VendorGroupOrderSetup';
import VendorOrderSummaryPage from '../pages/vendor/VendorOrderSummaryPage';
import NotFound from '../pages/NotFound';
import { Navigate } from 'react-router-dom';

const VendorRoutes = (
  <Route path="/vendor/*" element={
    <ProtectedRoute userRole="vendor">
      <Routes>
        <Route path="dashboard" element={<VendorDashboardPage />} />
        <Route path="services" element={<VendorServicesPage />} />
        <Route path="services/:id" element={<ServiceDetailPage />} />
        <Route path="orders" element={<VendorOrdersPage />} />
        <Route path="orders/:id" element={<VendorOrderDetailsPage />} />
        <Route path="calendar" element={<VendorCalendarPage />} />
        <Route path="team" element={<VendorTeamPage />} />
        <Route path="messages" element={<VendorMessagesPage />} />
        <Route path="settings" element={<VendorProfilePage />} />
        <Route path="invoices" element={<VendorInvoicesListPage />} />
        <Route path="invoices/new" element={<VendorNewInvoicePage />} />
        <Route path="invoices/create" element={<VendorInvoiceCreatePage />} />
        <Route path="invoices/:id/edit" element={<VendorProposalEditRedirect />} />
        {/* Alias routes - proposals and invoices are the same thing */}
        <Route path="proposals" element={<VendorInvoicesListPage />} />
        <Route path="proposals/:id/edit" element={<VendorProposalEditRedirect />} />
        <Route path="analytics" element={<VendorAnalyticsPage />} />
        <Route path="clients" element={<VendorClientManagementPage />} />
        <Route path="messaging" element={<VendorMessagingHub />} />
        <Route path="support" element={<VendorSupportPage />} />
        <Route path="enhanced-settings" element={<VendorEnhancedSettings />} />
        <Route path="create-service" element={<CreateServicePage />} />
        <Route path="services/edit/:id" element={<EditServicePage />} />
        <Route path="new-invoice" element={<VendorNewInvoicePage />} />
        <Route path="services/create" element={<Navigate to="/vendor/create-service" replace />} />
        <Route path="new-proposal" element={<VendorMarketPlace />} />
        <Route path="booking" element={<VendorBookingFlow />} />
        <Route path="group-order/setup" element={<VendorGroupOrderSetup />} />
        <Route path="order-summary" element={<VendorOrderSummaryPage />} />
        <Route path="order-summary/:id" element={<VendorOrderSummaryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ProtectedRoute>
  } />
);

export default VendorRoutes;
