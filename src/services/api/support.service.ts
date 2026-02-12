import BaseRequestService from "./baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export enum SupportCategoryEnum {
  GENERAL_SUPPORT = 'general_support',
  TECHNICAL_ISSUE = 'technical_issue',
  BILLING_PAYMENT = 'billing_payment',
  ACCOUNT_MANAGEMENT = 'account_management',
}

export enum SupportPriorityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum SupportStatusEnum {
  PENDING = 'pending',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export interface CreateSupportDto {
  category: SupportCategoryEnum;
  priority: SupportPriorityEnum;
  subject: string;
  message: string;
  orderId?: string;
}

export interface SupportTicket {
  id: string;
  category: SupportCategoryEnum;
  priority: SupportPriorityEnum;
  subject: string;
  message: string;
  status: SupportStatusEnum;
  createdById: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  order?: any;
}

class SupportService extends BaseRequestService {
  /**
   * Create a new support ticket
   */
  createSupportTicket(data: CreateSupportDto) {
    return this.post(`${API_URL}support`, data, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Get all support tickets (Admin only)
   */
  getAllSupportTickets(status?: SupportStatusEnum) {
    const params = status ? { status } : {};
    return this.get(`${API_URL}support`, {
      headers: getAuthHeader(),
      params,
    });
  }

  /**
   * Get a specific support ticket by ID
   */
  getSupportTicketById(ticketId: string) {
    return this.get(`${API_URL}support/${ticketId}`, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Update support ticket status (Admin only)
   */
  updateSupportTicketStatus(ticketId: string, status: SupportStatusEnum) {
    return this.patch(`${API_URL}support/${ticketId}/status`, { status }, {
      headers: getAuthHeader(),
    });
  }
}

export default new SupportService();
