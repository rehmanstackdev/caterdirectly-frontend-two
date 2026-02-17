import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class HostsService extends BaseRequestService {
  getHosts() {
    return this.get(`${API_URL}users/hosts`, {
      headers: getAuthHeader(),
    });
  }

  updateHostStatus(hostId: string, status: string) {
    return this.patch(`${API_URL}users/hosts/${hostId}/status`, { hostStatus: status }, {
      headers: getAuthHeader(),
    });
  }

  updateHostCommissionRate(hostId: string, commissionRate: number) {
    return this.patch(`${API_URL}users/hosts/${hostId}/commission-rate`, { commissionRate }, {
      headers: getAuthHeader(),
    });
  }

  deleteHost(userId: string) {
    return this.delete(`${API_URL}users/${userId}`, {
      headers: getAuthHeader(),
    });
  }
}

export default new HostsService();
