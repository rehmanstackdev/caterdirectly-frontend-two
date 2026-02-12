import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class UsersService extends BaseRequestService {
  getUsers(page?: number, limit?: number) {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    return this.get(`${API_URL}users`, {
      headers: getAuthHeader(),
      params,
    });
  }

  createUser(data: any) {
    return this.post(`${API_URL}auth/create-verified-user`, data, {
      headers: getAuthHeader(),
    });
  }

  updateUser(userId: string, data: any) {
    return this.patch(`${API_URL}users/${userId}/profile`, data, {
      headers: getAuthHeader(),
    });
  }

  deleteUser(userId: string) {
    return this.delete(`${API_URL}users/${userId}`, {
      headers: getAuthHeader(),
    });
  }
  editUser(userId: string, data: any) {
    return this.patch(`${API_URL}users/${userId}`, data, {
      headers: getAuthHeader(),
    });
  }

  getPermissionsByUserId(userId: string) {
    return this.get(`${API_URL}users/${userId}/permissions`, {
      headers: getAuthHeader(),
    });
  }
  getProfile(){
    return this.get(`${API_URL}users/profile`, {
      headers: getAuthHeader(),
    });
  }

  updateUserImage(userId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Note: Don't set Content-Type header - let axios set it automatically with boundary
    return this.patch(`${API_URL}users/${userId}/image`, formData, {
      headers: getAuthHeader(),
    });
  }
}

export default new UsersService();