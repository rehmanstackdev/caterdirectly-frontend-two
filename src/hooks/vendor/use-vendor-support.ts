import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'account' | 'general';
  admin_response?: string;
  created_at: string;
  updated_at: string;
  responded_at?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful_count: number;
}

interface SupportFormData {
  subject: string;
  message: string;
  category: string;
  priority: string;
}

export const useVendorSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Get vendor ID for current user
  const getVendorId = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error getting vendor ID:', error);
      return null;
    }
    
    return data.id;
  };

  // Fetch support tickets
  const fetchTickets = async () => {
    const vendorId = await getVendorId();
    if (!vendorId) return;

    const { data, error } = await supabase
      .from('vendor_support_tickets')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      return;
    }

    setTickets(data as SupportTicket[] || []);
  };

  // Fetch FAQ items
  const fetchFAQs = async () => {
    const { data, error } = await supabase
      .from('vendor_support_faq')
      .select('*')
      .eq('is_active', true)
      .order('helpful_count', { ascending: false });

    if (error) {
      console.error('Error fetching FAQs:', error);
      return;
    }

    setFaqs(data as FAQItem[] || []);
  };

  // Submit support ticket
  const submitSupportRequest = async (formData: SupportFormData) => {
    const vendorId = await getVendorId();
    if (!vendorId) {
      toast({
        title: "Error",
        description: "Unable to find vendor information",
        variant: "destructive"
      });
      return false;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('vendor_support_tickets')
        .insert({
          vendor_id: vendorId,
          subject: formData.subject,
          message: formData.message,
          category: formData.category,
          priority: formData.priority
        });

      if (error) throw error;

      toast({
        title: "Support request submitted",
        description: "We'll respond within 24 hours. You can track your request in the Tickets tab."
      });

      // Refresh tickets
      await fetchTickets();
      return true;
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast({
        title: "Error",
        description: "Failed to submit support request. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTickets(), fetchFAQs()]);
      setLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  return {
    tickets,
    faqs,
    loading,
    submitting,
    submitSupportRequest,
    refetch: () => {
      fetchTickets();
      fetchFAQs();
    }
  };
};