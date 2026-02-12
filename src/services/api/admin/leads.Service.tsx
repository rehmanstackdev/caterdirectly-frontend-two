import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class LeadsService extends BaseRequestService {
  getUnifiedEntities(filters: any) {
    return this.get(`${API_URL}users`, {
      headers: getAuthHeader(),
    });
  }

  getLeads(filters: any) {
    return this.get(`${API_URL}leads`, {
      headers: getAuthHeader(),
    });
  }

  getEntityCounts() {
    return this.get(`${API_URL}users/stats`, {
      headers: getAuthHeader(),
    });
  }

  getLeadPipelineStats() {
    return this.get(`${API_URL}leads/stats`, {
      headers: getAuthHeader(),
    });
  }

  createLead(data: any) {
    return this.post(`${API_URL}leads`, data, {
      headers: getAuthHeader(),
    });
  }

  updateLead(leadId: string, data: any) {
    return this.patch(`${API_URL}leads/${leadId}`, data, {
      headers: getAuthHeader(),
    });
  }

  updateLeadStatus(leadId: string, data: any) {
    return this.patch(`${API_URL}leads/${leadId}/status`, data, {
      headers: getAuthHeader(),
    });
  }

  assignLead(leadId: string, data: any) {
    return this.patch(`${API_URL}leads/${leadId}/assign`, data, {
      headers: getAuthHeader(),
    });
  }

  getLeadById(leadId: string) {
    return this.get(`${API_URL}leads/${leadId}`, {
      headers: getAuthHeader(),
    });
  }

  deleteLead(leadId: string) {
    return this.delete(`${API_URL}leads/${leadId}`, {
      headers: getAuthHeader(),
    });
  }

  bulkUploadLeads(data: any) {
    return this.post(`${API_URL}leads/bulk-upload`, data, {
      headers: getAuthHeader(),
    });
  }
}

export default new LeadsService();