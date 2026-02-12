import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";
import DashboardService from "../admin/dashboard.Service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class HostService extends BaseRequestService {
  addFavouriteService(serviceId: string) {
    return this.patch(`${API_URL}services/${serviceId}/favourite`, {
      isFavourite: true
    }, {
      headers: getAuthHeader(),
    });
  }
  removeFavouriteService(serviceId: string) {
    return this.patch(`${API_URL}services/${serviceId}/favourite`, {
      isFavourite: false
    }, {
      headers: getAuthHeader(),
    });
  }
  getFavouriteServices() {
    return this.get(`${API_URL}services/host/favourites`, {
      headers: getAuthHeader(),
    });
  }
  createEvent(data: any) {
    return DashboardService.createEvent(data);
  }
  
  getEventsByHost(hostId: string) {
    return this.get(`${API_URL}events/by-host?hostId=${hostId}`, {
      headers: getAuthHeader(),
    });
  }
  
  getOrdersByHost(hostId: string) {
    return this.get(`${API_URL}orders/host/${hostId}`, {
      headers: getAuthHeader(),
    });
  }

  getHostVendors() {
    return this.get(`${API_URL}invoices/host/vendors`, {
      headers: getAuthHeader(),
    });
  }
}

export default new HostService();
