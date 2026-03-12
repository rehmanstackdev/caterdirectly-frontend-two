import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;

export interface TeamMemberUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string | null;
}

export interface TeamMember {
  id: string;
  teamRole: 'staff' | 'manager' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  user: TeamMemberUser;
  invitedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface InviteTeamMemberPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'staff' | 'manager' | 'admin';
}

export interface UpdateTeamMemberPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: 'staff' | 'manager' | 'admin';
}

export interface MyPermissions {
  role: 'owner' | 'staff' | 'manager' | 'admin';
  vendorId: string;
  tabs: string[];
}

class VendorTeamServiceClass extends BaseRequestService {
  async inviteTeamMember(data: InviteTeamMemberPayload) {
    return this.post(`${ApiUrl}vendor-team/invite`, data, {
      headers: { ...getAuthHeader() },
    });
  }

  async getTeamMembers() {
    return this.get(`${ApiUrl}vendor-team/members`, {
      headers: { ...getAuthHeader() },
    });
  }

  async updateMember(memberId: string, data: UpdateTeamMemberPayload) {
    return this.patch(`${ApiUrl}vendor-team/${memberId}`, data, {
      headers: { ...getAuthHeader() },
    });
  }

  async updateMemberRole(memberId: string, role: 'staff' | 'manager' | 'admin') {
    return this.patch(`${ApiUrl}vendor-team/${memberId}/role`, { role }, {
      headers: { ...getAuthHeader() },
    });
  }

  async updateMemberStatus(memberId: string, status: 'active' | 'inactive') {
    return this.patch(`${ApiUrl}vendor-team/${memberId}/status`, { status }, {
      headers: { ...getAuthHeader() },
    });
  }

  async removeMember(memberId: string) {
    return this.delete(`${ApiUrl}vendor-team/${memberId}`, {
      headers: { ...getAuthHeader() },
    });
  }

  async getMyPermissions() {
    return this.get(`${ApiUrl}vendor-team/my-permissions`, {
      headers: { ...getAuthHeader() },
    });
  }
}

export const VendorTeamService = new VendorTeamServiceClass();
