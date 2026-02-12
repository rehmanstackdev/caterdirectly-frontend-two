import { useState, useCallback } from 'react';
import VendorsService from '@/services/api/admin/vendors.Service';
import { useToast } from '@/hooks/use-toast';

interface StripeConnectAccount {
  id: string;
  type: 'express' | 'standard';
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  email?: string;
  country?: string;
}

interface UseStripeConnectAccountReturn {
  account: StripeConnectAccount | null;
  loading: boolean;
  creating: boolean;
  creatingLink: boolean;
  creatingLoginLink: boolean;
  fetchAccount: (vendorId: string) => Promise<void>;
  createAccount: (vendorId: string, data: {
    email: string;
    businessName: string;
    country?: string;
    type?: 'express' | 'standard';
  }) => Promise<StripeConnectAccount | null>;
  createAccountLink: (vendorId: string, returnUrl: string, refreshUrl: string) => Promise<string | null>;
  createLoginLink: (vendorId: string) => Promise<string | null>;
}

export function useStripeConnectAccount(): UseStripeConnectAccountReturn {
  const { toast } = useToast();
  const [account, setAccount] = useState<StripeConnectAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creatingLink, setCreatingLink] = useState(false);
  const [creatingLoginLink, setCreatingLoginLink] = useState(false);

  const fetchAccount = useCallback(async (vendorId: string) => {
    if (!vendorId) {
      setAccount(null);
      return;
    }
    
    setLoading(true);
    try {
      const response = await VendorsService.getStripeConnectAccount(vendorId);
      console.log('Stripe Connect account response:', response);
      
      // Backend returns response.data.account
      if (response?.data?.account) {
        const accountData = response.data.account;
        setAccount({
          id: accountData.id,
          type: accountData.type,
          charges_enabled: accountData.charges_enabled || false,
          payouts_enabled: accountData.payouts_enabled || false,
          details_submitted: accountData.details_submitted || false,
          email: accountData.email,
          country: accountData.country,
        });
      } else if (response?.data?.stripeAccount) {
        // Fallback for different response structure
        const accountData = response.data.stripeAccount;
        setAccount({
          id: accountData.id,
          type: accountData.type,
          charges_enabled: accountData.charges_enabled || false,
          payouts_enabled: accountData.payouts_enabled || false,
          details_submitted: accountData.details_submitted || false,
          email: accountData.email,
          country: accountData.country,
        });
      } else {
        setAccount(null);
      }
    } catch (error: any) {
      console.error('Error fetching Stripe Connect account:', error);
      setAccount(null);
      // Don't show error toast if account doesn't exist (404)
      if (error?.response?.status !== 404 && error?.response?.status !== 400) {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to fetch Stripe Connect account",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createAccount = useCallback(async (
    vendorId: string,
    data: {
      email: string;
      businessName: string;
      country?: string;
      type?: 'express' | 'standard';
    }
  ): Promise<StripeConnectAccount | null> => {
    setCreating(true);
    try {
      const response = await VendorsService.createStripeConnectAccount(vendorId, data);
      console.log('Create Stripe Connect account response:', response);
      
      // Backend returns response.data.stripeAccount or response.data.vendor.stripeConnectAccountId
      const accountData = response?.data?.stripeAccount || response?.data?.account;
      
      if (accountData) {
        const account: StripeConnectAccount = {
          id: accountData.id,
          type: accountData.type || 'express',
          charges_enabled: accountData.charges_enabled || false,
          payouts_enabled: accountData.payouts_enabled || false,
          details_submitted: accountData.details_submitted || false,
          email: accountData.email || data.email,
          country: accountData.country || data.country || 'US',
        };
        setAccount(account);
        toast({
          title: "Success",
          description: "Stripe Connect account created successfully",
        });
        return account;
      }
      return null;
    } catch (error: any) {
      console.error('Error creating Stripe Connect account:', error);
      
      const errorData = error?.response?.data;
      const errorMessage = errorData?.message || error?.message || "Failed to create Stripe Connect account";
      
      // Check if it's a Stripe Connect not enabled error
      const isConnectNotEnabled = 
        errorData?.errorCode === 'STRIPE_CONNECT_NOT_ENABLED' || 
        errorMessage?.includes('Connect') || 
        errorMessage?.includes('signed up for Connect');
      
      if (isConnectNotEnabled) {
        const docsUrl = errorData?.stripeDocsUrl || 'https://stripe.com/docs/connect';
        toast({
          title: "Stripe Connect Not Enabled",
          description: `Stripe Connect must be enabled in your Stripe Dashboard before creating vendor accounts. Visit: ${docsUrl}`,
          variant: "destructive",
          duration: 12000, // Show for 12 seconds
        });
        // Open docs in new tab
        setTimeout(() => {
          window.open(docsUrl, '_blank');
        }, 500);
      } else {
        toast({
          title: "Error Creating Account",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      return null;
    } finally {
      setCreating(false);
    }
  }, [toast]);

  const createAccountLink = useCallback(async (
    vendorId: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<string | null> => {
    setCreatingLink(true);
    try {
      const response = await VendorsService.createStripeAccountLink(vendorId, returnUrl, refreshUrl);
      const url = response?.data?.url;
      
      if (url) {
        toast({
          title: "Onboarding Link Created",
          description: "Redirecting to Stripe onboarding...",
        });
        return url;
      }
      return null;
    } catch (error: any) {
      console.error('Error creating account link:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create onboarding link",
        variant: "destructive",
      });
      return null;
    } finally {
      setCreatingLink(false);
    }
  }, [toast]);

  const createLoginLink = useCallback(async (vendorId: string): Promise<string | null> => {
    setCreatingLoginLink(true);
    try {
      const response = await VendorsService.createStripeLoginLink(vendorId);
      const url = response?.data?.url;
      
      if (url) {
        toast({
          title: "Login Link Created",
          description: "Opening Stripe dashboard...",
        });
        return url;
      }
      return null;
    } catch (error: any) {
      console.error('Error creating login link:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create login link",
        variant: "destructive",
      });
      return null;
    } finally {
      setCreatingLoginLink(false);
    }
  }, [toast]);

  return {
    account,
    loading,
    creating,
    creatingLink,
    creatingLoginLink,
    fetchAccount,
    createAccount,
    createAccountLink,
    createLoginLink,
  };
}

