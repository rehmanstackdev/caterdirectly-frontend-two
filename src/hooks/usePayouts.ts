import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';

export type Payout = {
  id: string;
  entity_type: 'host' | 'vendor';
  entity_id: string;
  currency: string;
  amount_gross: number; // cents
  amount_fee: number;   // cents
  amount_net: number;   // cents (generated)
  status: 'scheduled' | 'processing' | 'paid' | 'failed' | 'on_hold';
  hold_reason?: string | null;
  scheduled_for: string;
  paid_at?: string | null;
  source_type: 'order' | 'ticket_sale';
  source_id: string;
  created_at: string;
  updated_at: string;
};

export function usePayouts() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayouts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('payouts')
          .select('*')
          .eq('entity_type', 'host')
          .eq('entity_id', user.id)
          .order('scheduled_for', { ascending: false });

        if (error) throw error;
        setPayouts(data as Payout[]);
      } catch (e: any) {
        setError(e.message || 'Failed to load payouts');
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [user]);

  return { payouts, loading, error };
}
