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

  updateEvent(eventId: string, data: any) {
    return this.patch(`${API_URL}events/${eventId}`, data, {
      headers: getAuthHeader(),
    });
  }

  deleteEvent(eventId: string) {
    return this.delete(`${API_URL}events/${eventId}`, {
      headers: getAuthHeader(),
    });
  }
}

export default new EventsService();
