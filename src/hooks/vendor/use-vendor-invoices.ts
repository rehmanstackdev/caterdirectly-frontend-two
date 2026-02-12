import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { getAuthHeader } from '@/utils/utils';

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

interface VendorInvoice {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  status: 'draft' | 'sent' | 'viewed' | 'negotiation' | 'accepted' | 'rejected' | 'expired';
  total: number;
  createdAt: string;
  sentAt?: string;
  viewedAt?: string;
  expiryDate: string;
  followUpDate?: string;
  eventDate?: string;
  eventType: string;
  responseRate: number;
}

export const useVendorInvoices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}vendor/invoices`, {
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 200 && result.data) {
        setInvoices(result.data);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  return {
    invoices,
    loading,
    refreshInvoices: fetchInvoices
  };
};

// Legacy export for backwards compatibility
export const useVendorProposals = useVendorInvoices;