import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class InvoicesService extends BaseRequestService {
  // Map frontend status values to API status values
  private mapStatusToAPI(status: string): string {
    const statusMap: Record<string, string> = {
      'drafted': 'draft',
      'pending': 'pending',
      'paid': 'paid',
      'expired': 'expired',
      'declined': 'declined',
      'sent': 'sent',
      'cancelled': 'cancelled',
    };
    return statusMap[status] || status;
  }

  getAllInvoices(page?: number, limit?: number, status?: string, search?: string) {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (status && status !== 'all') {
      params.status = this.mapStatusToAPI(status);
    }
    if (search && search.trim()) {
      params.search = search.trim();
    }

    return this.get(`${API_URL}invoices/admin/all`, {
      headers: getAuthHeader(),
      params,
    });
  }

  deleteInvoice(id: string) {
    return this.delete(`${API_URL}invoices/${id}`, {
      headers: getAuthHeader(),
    });
  }

  deleteInvoices(ids: string[]) {
    return this.delete(`${API_URL}invoices/admin/delete`, {
      headers: getAuthHeader(),
      data: { ids }
    });
  }

  updateInvoiceStatus(id: string, status: string) {
    return this.patch(`${API_URL}invoices/admin/${id}/status`, { status }, {
      headers: getAuthHeader(),
    });
  }
}

export default new InvoicesService();