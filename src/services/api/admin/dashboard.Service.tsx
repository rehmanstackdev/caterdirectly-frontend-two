import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class DashboardService extends BaseRequestService {
  getDashboardStats() {
    return this.get(`${API_URL}users/dashboard/stats`, {
      headers: getAuthHeader(),
    });
  }
  getEventsByDate(date: any) {
    // Build query parameters
    const params = new URLSearchParams();
    if (date?.endDate) {
      params.append('endDate', date.endDate);
    }
    if (date?.startDate) {
      params.append('startDate', date.startDate);
    }

    
    
    const queryString = params.toString();
    const url = `${API_URL}events/by-date-range${queryString ? `?${queryString}` : ''}`;
    
    return this.get(url, {
      headers: getAuthHeader(),
    });
  }

  createEvent(data:any){
    return this.post(`${API_URL}events/create`, data, {
      headers: getAuthHeader(),
    });
  }

  getEventById(eventId: string) {
    return this.get(`${API_URL}events/${eventId}`, {
      headers: getAuthHeader(),
    });
  }
}

export default new DashboardService();
