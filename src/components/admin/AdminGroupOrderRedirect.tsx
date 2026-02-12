import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import invoiceService from '@/services/api/admin/invoice.service';

const AdminGroupOrderRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGroupOrderAPI = async () => {
      try {
        // Call the booking API with group order data
        const invoiceData = {
          eventName: 'Group Order Setup',
          companyName: '',
          eventLocation: '',
          eventDate: '',
          serviceTime: '',
          guestCount: 1,
          contactName: '',
          phoneNumber: '',
          emailAddress: '',
          addBackupContact: false,
          additionalNotes: '',
          taxExemptStatus: false,
          waiveServiceFee: false,
          paymentSettings: 'credit_card',
          isGroupOrder: true,
          services: [],
          customLineItems: []
        };

        await invoiceService.createInvoice(invoiceData);
      } catch (error) {
        console.error('Group order API call failed:', error);
      } finally {
        // Always redirect to ordersummary regardless of API success/failure
        navigate('/order-summary', { replace: true });
      }
    };

    handleGroupOrderAPI();
  }, [navigate]);

  return <div>Processing group order...</div>;
};

export default AdminGroupOrderRedirect;