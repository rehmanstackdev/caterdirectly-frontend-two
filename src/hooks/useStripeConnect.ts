
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type StripeStatus = {
  connected: boolean;
  entity: 'vendor' | 'host';
  account_id?: string;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  requirements_disabled_reason?: string | null;
  error?: string;
};

export function useStripeConnect() {
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    console.log("useStripeConnect: fetching account status");
    const { data, error } = await supabase.functions.invoke("connect-account-status");
    if (error) {
      console.error("useStripeConnect: status error", error);
      setStatus({ connected: false, entity: 'host', error: error.message });
    } else {
      console.log("useStripeConnect: status response", data);
      setStatus(data as StripeStatus);
    }
    setLoading(false);
  }, []);

  const startOnboarding = useCallback(async () => {
    setOnboardingLoading(true);
    console.log("useStripeConnect: requesting onboarding link");
    // Open a blank tab synchronously to avoid popup blockers
    const newTab = window.open("about:blank", "_blank");
    const { data, error } = await supabase.functions.invoke("connect-onboarding-link");
    setOnboardingLoading(false);
    if (error) {
      console.error("useStripeConnect: onboarding error", error);
      if (newTab) newTab.close();
      return null;
    }
    const url = (data as any)?.url as string | undefined;
    if (url) {
      if (newTab) {
        newTab.location.href = url;
      } else {
        window.open(url, "_blank");
      }
    } else {
      if (newTab) newTab.close();
    }
    return url ?? null;
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return {
    status,
    loading,
    onboardingLoading,
    refreshStatus,
    startOnboarding,
  };
}
