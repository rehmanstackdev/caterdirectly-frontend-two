import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

export interface VendorProposal {
  id: string;
  title: string | null;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  client_company: string | null;
  vendor_name: string | null;
  message: string | null;
  expires_at: string | null;
  service_date: string | null;
  service_time: string | null;
  delivery_notes: string | null;
  items: any;
  total: number | null;
  status: string;
  revision_message: string | null;
  created_at: string;
  updated_at: string;
  order_id: string;
  token: string;
}

export const useVendorProposals = () => {
  const [proposals, setProposals] = useState<VendorProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProposals = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get vendor ID for the current user
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id, company_name')
        .eq('user_id', user.id)
        .single();

      if (vendorError || !vendorData) {
        throw new Error('Vendor not found');
      }

      // Get orders for this vendor to find related proposals
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('vendor_id', vendorData.id);

      if (ordersError) {
        throw new Error('Failed to fetch orders');
      }

      const orderIds = ordersData.map(order => order.id);

      if (orderIds.length === 0) {
        setProposals([]);
        return;
      }

      // Fetch invoices for these orders
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('invoices')
        .select('*')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });

      if (proposalsError) {
        throw new Error('Failed to fetch proposals');
      }

      setProposals(proposalsData || []);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch proposals');
      toast({
        title: "Error",
        description: "Failed to load proposals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProposalStatus = async (proposalId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);

      if (error) {
        throw error;
      }

      // Refresh proposals
      await fetchProposals();
      
      toast({
        title: "Success",
        description: `Proposal ${status === 'paid' ? 'marked as paid' : 'updated'} successfully`
      });
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast({
        title: "Error",
        description: "Failed to update proposal",
        variant: "destructive"
      });
    }
  };

  const sendProposal = async (proposalId: string) => {
    try {
      // Get proposal details
      const proposal = proposals.find(p => p.id === proposalId);
      if (!proposal) {
        throw new Error('Proposal not found');
      }

      // Update status first
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ 
          status: 'sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', proposalId);

      if (updateError) {
        throw updateError;
      }

      // Send invoice email via send-email function with proposal_notification template
      const invoiceUrl = `${window.location.origin}/invoices/${proposal.token}`;
      
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          templateName: 'proposal_notification',
          recipientEmail: proposal.client_email,
          recipientName: proposal.client_name,
          variables: {
            vendor_name: proposal.vendor_name || 'Your Vendor',
            proposal_title: proposal.title || 'Service Proposal',
            service_date: proposal.service_date || new Date().toISOString(),
            proposal_total: proposal.total || 0,
            expires_at: proposal.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            proposal_url: invoiceUrl
          }
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't throw error here as the proposal status was already updated
        toast({
          title: "Warning",
          description: "Proposal status updated but email sending failed. Please contact the client manually.",
          variant: "destructive"
        });
      }

      await fetchProposals();
      
      toast({
        title: "Success",
        description: "Proposal sent successfully"
      });
    } catch (error) {
      console.error('Error sending proposal:', error);
      toast({
        title: "Error",
        description: "Failed to send proposal",
        variant: "destructive"
      });
    }
  };

  const deleteProposal = async (proposalId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', proposalId);

      if (error) {
        throw error;
      }

      await fetchProposals();
      
      toast({
        title: "Success",
        description: "Proposal deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast({
        title: "Error",
        description: "Failed to delete proposal",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user]);

  return {
    proposals,
    loading,
    error,
    refetch: fetchProposals,
    updateProposalStatus,
    sendProposal,
    deleteProposal
  };
};