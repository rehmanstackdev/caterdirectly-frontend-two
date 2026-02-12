import BaseRequestService from "./baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class UserService extends BaseRequestService {
  getSuperAdmins() {
    return this.get(`${API_URL}users/super-admins`, {
      headers: getAuthHeader(),
    });
  }
}

export default new UserService();