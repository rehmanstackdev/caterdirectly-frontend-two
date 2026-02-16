import BaseRequestService from "../../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface AddHostGuestPayload {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  eventId: string;
  ticketId: string;
}

export interface UpdateHostGuestPayload {
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  eventId?: string;
  ticketId?: string;
}

export interface HostGuestResponse {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  eventId?: string;
  ticketId?: string;
  createdAt?: string;
}

class AddGuestService extends BaseRequestService {
  addHostGuest(data: AddHostGuestPayload) {
    return this.post(`${API_URL}guests/host-guests`, data, {
      headers: getAuthHeader(),
    });
  }

  getHostGuests(search?: string, recentGuest?: boolean) {
    const params = new URLSearchParams();

    if (search && search.trim()) {
      params.set("search", search.trim());
    }

    if (typeof recentGuest === "boolean") {
      params.set("recentGuest", String(recentGuest));
    }

    const query = params.toString();

    return this.get(`${API_URL}guests/host-guests${query ? `?${query}` : ""}`, {
      headers: getAuthHeader(),
    });
  }
  sendGuestPaymentIntent(guestId: string) {
    return this.post(
      `${API_URL}guests/host-guests/${guestId}/payment-intent`,
      {},
      {
        headers: getAuthHeader(),
      },
    );
  }
  updateHostGuest(guestId: string, data: UpdateHostGuestPayload) {
    return this.patch(`${API_URL}guests/host-guests/${guestId}`, data, {
      headers: getAuthHeader(),
    });
  }

  deleteHostGuest(guestId: string) {
    return this.delete(`${API_URL}guests/host-guests/${guestId}`, {
      headers: getAuthHeader(),
    });
  }
}

export default new AddGuestService();
