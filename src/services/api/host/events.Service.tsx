import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class EventsService extends BaseRequestService {
  getEventsByHost(hostId: string) {
    return this.get(`${API_URL}events/by-host?hostId=${hostId}`, {
      headers: getAuthHeader(),
    });
  }

  getHostEvents() {
    return this.get(`${API_URL}events/host`, {
      headers: getAuthHeader(),
    });
  }
}

export default new EventsService();
