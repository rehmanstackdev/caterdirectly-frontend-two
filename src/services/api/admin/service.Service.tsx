import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class GetService extends BaseRequestService {
    getAllServices(status?: string, page?: number, limit?: number) {
        const params: any = {};
        if (status) params.status = status;
        if (page) params.page = page;
        if (limit) params.limit = limit;

        return this.get(`${API_URL}services`, {
            headers: getAuthHeader(),
            params,
        });
    }

}

export default new GetService();
