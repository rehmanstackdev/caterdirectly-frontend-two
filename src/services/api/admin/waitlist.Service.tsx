import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class WaitlistService extends BaseRequestService {
  getWaitlistEntries() {
    return this.get(`${API_URL}waitlist/all`, {
      headers: getAuthHeader(),
    });
  }

  deleteWaitlistEntry(entryId: string) {
    return this.delete(`${API_URL}waitlist/${entryId}`, {
      headers: getAuthHeader(),
    });
  }

  createWaitlistEntry(data: any) {
    return this.post(`${API_URL}waitlist`, data, {
      headers: getAuthHeader(),
    });
  }
}

export default new WaitlistService();