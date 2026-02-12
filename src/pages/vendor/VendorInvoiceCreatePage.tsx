
import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import { InvoiceForm } from '@/components/shared/InvoiceForm';

function VendorInvoiceCreatePage() {
  return (
    <VendorDashboard activeTab="invoices">
      <InvoiceForm 
        userRole="vendor"
        onBack={() => window.history.back()}
      />
    </VendorDashboard>
  );
};

export default VendorInvoiceCreatePage;
