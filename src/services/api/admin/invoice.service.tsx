import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

console.log('🔧 [InvoiceService] Environment API URL:', ApiUrl);
console.log('🔧 [InvoiceService] Final API URL:', API_URL);

interface InvoiceData {
  eventName: string;
  companyName: string;
  eventLocation: string;
  eventDate: string;
  serviceTime: string;
  guestCount: number;
  contactName: string;
  phoneNumber: string;
  emailAddress: string;
  addBackupContact: boolean;
  additionalNotes: string;
  taxExemptStatus: boolean;
  waiveServiceFee: boolean;
  budgetPerPerson?: number;
  budget?: number;
  selectItem?: string;
  quantity?: number;
  orderDeadline?: string;
  inviteFriends?: Array<{
    email: string;
    acceptanceStatus: boolean;
  }>;
  paymentSettings?: string;
  isGroupOrder?: boolean;
  adminOverrideNotes?: string;
  services: Array<{
    serviceType: string;
    serviceName: string;
    totalPrice: number;
    priceType: string;
    deliveryFee?: number;
    deliveryRanges?: Record<string, number>;
    cateringItems?: Array<{
      menuName: string;
      menuItemName: string;
      price: number;
      quantity: number;
      totalPrice: number;
      cateringId: string;
      serviceId?: string;
    }>;
    partyRentalItems?: Array<any>;
    staffItems?: Array<{
      name: string;
      pricingType: string;
      perHourPrice: number;
      hours: number;
      totalPrice: number;
      staffId: string;
    }>;
    venueItems?: Array<any>;
  }>;
  customLineItems: Array<{
    label: string;
    type: string;
    mode: string;
    value: number;
    taxable: boolean;
    statusForDrafting: boolean;
  }>;
}

class InvoiceService extends BaseRequestService {
  createInvoice(data: InvoiceData) {
    console.log('🔧 [InvoiceService] createInvoice called');
    console.log('🌐 [InvoiceService] API URL:', `${API_URL}invoices`);
    console.log('🔑 [InvoiceService] Auth Headers:', getAuthHeader());
    console.log('📤 [InvoiceService] Request Data:', data);
    console.log('🏢 [InvoiceService] Company Name:', data.companyName);
    console.log('👥 [InvoiceService] Is Group Order:', data.isGroupOrder);
    
    const cleanedData = { ...data };
    
    if (!data.isGroupOrder) {
      // For regular invoices, set group fields to null and add adminOverrideNotes
      cleanedData.budgetPerPerson = null;
      cleanedData.budget = null;
      cleanedData.selectItem = null;
      cleanedData.quantity = null;
      cleanedData.orderDeadline = null;
      cleanedData.inviteFriends = null;
      cleanedData.paymentSettings = null;
      cleanedData.adminOverrideNotes = "";
      
      // Add missing item arrays and ensure serviceId is present
      cleanedData.services = cleanedData.services.map(service => ({
        ...service,
        cateringItems: service.cateringItems?.map(item => ({
          ...item,
          serviceId: item.cateringId
        })) || [],
        partyRentalItems: [],
        staffItems: service.staffItems || [],
        venueItems: []
      }));
    }
    
    console.log('📦 [InvoiceService] Full payload being sent:', JSON.stringify(cleanedData, null, 2));
    
    return this.post(`${API_URL}invoices`, cleanedData, {
      headers: getAuthHeader(),
    });
  }

  async createGroupOrderInvoice(data: InvoiceData) {
    console.log('🔧 [InvoiceService] createGroupOrderInvoice called');
    console.log('🌐 [InvoiceService] API URL:', `${API_URL}invoices`);
    console.log('🔑 [InvoiceService] Auth Headers:', getAuthHeader());
    console.log('📤 [InvoiceService] Request Data:', data);
    console.log('🏢 [InvoiceService] Company Name:', data.companyName);
    console.log('👥 [InvoiceService] Is Group Order:', data.isGroupOrder);
    console.log('👥 [InvoiceService] InviteFriends received:', data.inviteFriends);
    console.log('👥 [InvoiceService] InviteFriends length:', data.inviteFriends?.length);
    console.log('👥 [InvoiceService] InviteFriends type:', typeof data.inviteFriends);
    
    const authHeaders = getAuthHeader();
    
    console.log('📦 [InvoiceService] Final payload being sent to API:', JSON.stringify(data, null, 2));
    
    try {
      const response = await fetch(`${API_URL}invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(data)
      });
      
      console.log('📥 [InvoiceService] Fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [InvoiceService] Fetch error response:', errorText);
        
        let errorMessage = `HTTP ${response.status}: ${errorText}`;
        
        // Try to parse error response for more specific error messages
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If parsing fails, use the original error text
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ [InvoiceService] Fetch success:', result);
      return result;
    } catch (error) {
      console.error('❌ [InvoiceService] Fetch error:', error);
      throw error;
    }
  }

  getInvoiceOrderSummary(invoiceId: string) {
    return this.get(`${API_URL}invoices/${invoiceId}/summary`, {
      headers: getAuthHeader(),
    });
  }
}

export default new InvoiceService();