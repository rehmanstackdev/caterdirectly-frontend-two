
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { VendorPermissionsProvider } from '../contexts/VendorPermissionsContext';
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
import VendorTabGuard from '../components/vendor/VendorTabGuard';

const VendorRoutes = (
  <Route path="/vendor/*" element={
    <ProtectedRoute userRole="vendor">
      <VendorPermissionsProvider>
      <Routes>
        {/* All roles: dashboard, orders, messages, calendar */}
        <Route path="dashboard" element={<VendorDashboardPage />} />
        <Route path="orders" element={<VendorOrdersPage />} />
        <Route path="orders/:id" element={<VendorOrderDetailsPage />} />
        <Route path="messages" element={<VendorMessagesPage />} />
        <Route path="messaging" element={<VendorMessagingHub />} />
        <Route path="calendar" element={<VendorCalendarPage />} />

        {/* Manager+ : services, analytics */}
        <Route path="services" element={<VendorTabGuard tabId="services"><VendorServicesPage /></VendorTabGuard>} />
        <Route path="services/:id" element={<VendorTabGuard tabId="services"><ServiceDetailPage /></VendorTabGuard>} />
        <Route path="create-service" element={<VendorTabGuard tabId="services"><CreateServicePage /></VendorTabGuard>} />
        <Route path="services/edit/:id" element={<VendorTabGuard tabId="services"><EditServicePage /></VendorTabGuard>} />
        <Route path="services/create" element={<Navigate to="/vendor/create-service" replace />} />
        <Route path="analytics" element={<VendorTabGuard tabId="analytics"><VendorAnalyticsPage /></VendorTabGuard>} />
        <Route path="clients" element={<VendorTabGuard tabId="analytics"><VendorClientManagementPage /></VendorTabGuard>} />
        <Route path="invoices" element={<VendorTabGuard tabId="services"><VendorInvoicesListPage /></VendorTabGuard>} />
        <Route path="invoices/new" element={<VendorTabGuard tabId="services"><VendorNewInvoicePage /></VendorTabGuard>} />
        <Route path="invoices/create" element={<VendorTabGuard tabId="services"><VendorInvoiceCreatePage /></VendorTabGuard>} />
        <Route path="invoices/:id/edit" element={<VendorTabGuard tabId="services"><VendorProposalEditRedirect /></VendorTabGuard>} />
        <Route path="proposals" element={<VendorTabGuard tabId="services"><VendorInvoicesListPage /></VendorTabGuard>} />
        <Route path="proposals/:id/edit" element={<VendorTabGuard tabId="services"><VendorProposalEditRedirect /></VendorTabGuard>} />
        <Route path="new-invoice" element={<VendorTabGuard tabId="services"><VendorNewInvoicePage /></VendorTabGuard>} />
        <Route path="new-proposal" element={<VendorTabGuard tabId="services"><VendorMarketPlace /></VendorTabGuard>} />

        {/* Admin+ : team, settings */}
        <Route path="team" element={<VendorTabGuard tabId="team"><VendorTeamPage /></VendorTabGuard>} />
        <Route path="settings" element={<VendorTabGuard tabId="settings"><VendorProfilePage /></VendorTabGuard>} />
        <Route path="enhanced-settings" element={<VendorTabGuard tabId="settings"><VendorEnhancedSettings /></VendorTabGuard>} />
        <Route path="support" element={<VendorSupportPage />} />

        {/* Other routes */}
        <Route path="booking" element={<VendorBookingFlow />} />
        <Route path="group-order/setup" element={<VendorGroupOrderSetup />} />
        <Route path="order-summary" element={<VendorOrderSummaryPage />} />
        <Route path="order-summary/:id" element={<VendorOrderSummaryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </VendorPermissionsProvider>
    </ProtectedRoute>
  } />
);

export default VendorRoutes;
