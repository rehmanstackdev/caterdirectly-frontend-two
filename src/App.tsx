import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './contexts/auth';
import { CartProvider } from '@/contexts/CartContext';
import { InvoiceProvider } from './contexts/InvoiceContext';
import { FilterProvider } from './contexts/FilterContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { LocationProvider } from './hooks/use-location';
import { GroupOrderProvider } from './contexts/GroupOrderContext';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

import AdminRoutes from './routes/adminRoutes';
import VendorRoutes from './routes/vendorRoutes';
import HostRoutes from './routes/hostRoutes';
import EventRoutes from './routes/eventRoutes';
import OrderRoutes from './routes/orderRoutes';
import AuthRoutes from './routes/authRoutes';
import PublicRoutes from './routes/publicRoutes';
import UnsubscribePage from './pages/UnsubscribePage';

const queryClient = new QueryClient();

function App() {

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <LocationProvider>
            <LoadingProvider>
              <FilterProvider>
                <InvoiceProvider>
                  <QueryClientProvider client={queryClient}>
                    <CartProvider>
                      <GroupOrderProvider>
                        <Toaster />
                        <Routes>
                        {/* Public routes */}
                        {PublicRoutes}
                        
                        {/* Unsubscribe route */}
                        <Route path="/unsubscribe" element={<UnsubscribePage />} />

                        {/* Auth routes */}
                        {AuthRoutes}

                        {/* Protected routes */}
                        {AdminRoutes}
                        {VendorRoutes}
                        {HostRoutes}
                        {EventRoutes}
                        {OrderRoutes}
                        </Routes>
                      </GroupOrderProvider>
                    </CartProvider>
                  </QueryClientProvider>
                </InvoiceProvider>
              </FilterProvider>
            </LoadingProvider>
          </LocationProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
export default App;