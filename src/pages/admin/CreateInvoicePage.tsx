import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { Loader2 } from 'lucide-react';

interface CreateInvoicePageState {
  selectedServices?: any[];
  selectedItems?: Record<string, number>;
  formData?: any;
  vendor?: any;
}

function CreateInvoicePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as CreateInvoicePageState) || {};

  useEffect(() => {
    const createInvoiceDirectly = async () => {
      // Single Source of Truth: redirect into the Order Summary flow in invoice mode
      if (state?.selectedServices && Array.isArray(state.selectedServices) && state.selectedServices.length > 0) {
        // Store the invoice data for the form to pick up
        // Clear invoiceId to ensure we create a NEW invoice (not edit existing)
        sessionStorage.setItem('invoiceData', JSON.stringify({
          selectedServices: state.selectedServices,
          selectedItems: state.selectedItems || {},
          clientInfo: state.formData || {},
          vendor: state.vendor,
          invoiceId: null, // Explicitly clear for new invoices
          token: null, // Explicitly clear for new invoices
        }));
        navigate('/order-summary?mode=invoice', { replace: true, state });
      } else {
        // If we don't have booking context yet, send user to booking to collect it
        navigate('/booking?mode=invoice', { replace: true });
      }
    };
    
    createInvoiceDirectly();
  }, []);

  return (
    <Dashboard userRole="admin" activeTab="invoices">
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          <p>Redirecting to invoice builder…</p>
        </div>
      </div>
    </Dashboard>
  );
}

export default CreateInvoicePage;
