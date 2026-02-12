import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import invoiceService from '@/services/api/admin/invoice.service';

const AdminBookingRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleBookingAPI = async () => {
      try {
        // Call the booking API with minimal data
        const invoiceData = {
          eventName: 'Admin Booking',
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
          isGroupOrder: false,
          services: [],
          customLineItems: []
        };

        await invoiceService.createInvoice(invoiceData);
      } catch (error) {
        console.error('Booking API call failed:', error);
      } finally {
        // Always redirect to ordersummary regardless of API success/failure
        navigate('/order-summary', { replace: true });
      }
    };

    handleBookingAPI();
  }, [navigate]);

  return <div>Processing booking...</div>;
};

export default AdminBookingRedirect;