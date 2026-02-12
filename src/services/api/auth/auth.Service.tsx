import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class AuthService extends BaseRequestService {

  registerUser(data: any) {
    return this.post(`${API_URL}auth/register`, data);
  }

  loginUser(data: any) {
    return this.post(`${API_URL}auth/login`, data);
  }

  verifyEmail(token: string) {
    return this.get(`${API_URL}auth/verify-email?token=${token}`);
  }



}

export default new AuthService();
