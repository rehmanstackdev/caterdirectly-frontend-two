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

export interface BulkImportGuestsPayload {
  guests: Array<{
    name: string;
    email: string;
    phone?: string;
    companyName?: string;
    jobTitle?: string;
    eventId: string;
    ticketId: string;
  }>;
}

export interface BulkImportResult {
  total: number;
  successful: number;
  duplicates: number;
  failed: number;
  failedDetails?: Array<{ email: string; reason: string }>;
}

export interface HostGuestResponse {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  createdAt?: string;
}

class AddGuestService extends BaseRequestService {
  addHostGuest(data: AddHostGuestPayload) {
    return this.post(`${API_URL}guests/host-guests`, data, {
      headers: getAuthHeader(),
    });
  }

  getHostGuests(search?: string, recentGuest?: boolean, page = 1, limit = 10) {
    const params = new URLSearchParams();

    if (search && search.trim()) {
      params.set("search", search.trim());
    }

    params.set("filter", recentGuest === true ? "recent" : "all");
    params.set("page", String(page));
    params.set("limit", String(limit));

    return this.get(`${API_URL}guests/host-guests?${params.toString()}`, {
      headers: getAuthHeader(),
    });
  }
  getHostEarnings() {
    return this.get(`${API_URL}guests/host-earnings`, {
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

  bulkImportGuests(data: BulkImportGuestsPayload) {
    return this.post(`${API_URL}guests/host-guests/bulk`, data, {
      headers: getAuthHeader(),
    });
  }
}

export default new AddGuestService();
