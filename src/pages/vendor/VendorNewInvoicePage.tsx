
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function VendorNewInvoicePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to marketplace in vendor invoice mode
    navigate('/marketplace?mode=invoice&vendor=true');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Redirecting to invoice creation...</p>
      </div>
    </div>
  );
};

export default VendorNewInvoicePage;
