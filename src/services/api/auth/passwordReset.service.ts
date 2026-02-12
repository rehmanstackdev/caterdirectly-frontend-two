import BaseRequestService from "../baseRequest.service";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

interface ResetPasswordRequest {
  email: string;
  role: 'admin' | 'vendor' | 'host';
}

class PasswordResetService extends BaseRequestService {
  
  requestPasswordReset(data: ResetPasswordRequest) {
    return this.post(`${API_URL}auth/request-reset-password`, data);
  }

}

export default new PasswordResetService();