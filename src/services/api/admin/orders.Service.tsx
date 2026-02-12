import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class OrdersService extends BaseRequestService {
  getAllOrders(page?: number, limit?: number) {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    return this.get(`${API_URL}orders/admin/all`, {
      headers: getAuthHeader(),
      params,
    });
  }
}

export default new OrdersService();