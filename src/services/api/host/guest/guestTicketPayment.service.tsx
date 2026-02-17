import BaseRequestService from "@/services/api/baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const cleanApiUrl = String(ApiUrl || "").endsWith("/")
  ? String(ApiUrl).slice(0, -1)
  : String(ApiUrl || "");

export interface GuestPaymentDetails {
  id: string;
  name: string;
  clientSecret: string;
  email: string;
  ticketPrice: number;
  paymentStatus?: string;
  stripePaymentIntentId?: string;
  event?: {
    id: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
    venueAddress: string;
  };
  ticket?: {
    id: string;
    ticketName: string;
    price: string;
  };
}

class GuestTicketPaymentService extends BaseRequestService {
  getGuestPaymentDetails(guestId: string) {
    return this.get(
      `${cleanApiUrl}/guests/host-guests/${encodeURIComponent(guestId)}`,
    );
  }

  confirmGuestPayment(guestId: string, paymentMethodId: string) {
    return this.post(
      `${cleanApiUrl}/guests/host-guests/${encodeURIComponent(guestId)}/confirm-payment`,
      {
        paymentMethodId,
      },
    );
  }
}

export default new GuestTicketPaymentService();
