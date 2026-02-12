import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

interface InvitationDetails {
  id: string;
  vendor_id: string;
  vendor_name: string;
  email: string;
  name: string;
  role: string;
  invited_by_name: string;
  expires_at: string;
  is_expired: boolean;
}

export const useTeamInvitation = (token: string) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    if (!token) {
      setLoading(false);
      setError('No invitation token provided');
      return;
    }

    try {
      setLoading(true);
      
      // Cast to any to bypass type checking until Supabase types regenerate
      const { data, error: fetchError } = await (supabase as any)
        .from('vendor_team_members')
        .select(`
          id,
          vendor_id,
          vendors (
            business_name
          ),
          email,
          name,
          role,
          invitation_expires_at,
          invited_by
        `)
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .maybeSingle();

      if (fetchError || !data) {
        setError('Invitation not found or already used');
        return;
      }

      const isExpired = new Date(data.invitation_expires_at) < new Date();

      // Get inviter name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', data.invited_by)
        .maybeSingle();

      setInvitation({
        id: data.id,
        vendor_id: data.vendor_id,
        vendor_name: (data.vendors as any)?.business_name || 'Vendor',
        email: data.email,
        name: data.name,
        role: data.role,
        invited_by_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'A team member',
        expires_at: data.invitation_expires_at,
        is_expired: isExpired
      });

      if (isExpired) {
        setError('This invitation has expired');
      }
    } catch (err) {
      console.error('Error fetching invitation:', err);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in or create an account to accept this invitation",
        variant: "destructive"
      });
      return false;
    }

    if (!invitation) {
      toast({
        title: "Error",
        description: "Invitation details not found",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error: updateError } = await supabase
        .from('vendor_team_members')
        .update({
          user_id: user.id,
          status: 'active',
          accepted_at: new Date().toISOString(),
          invitation_token: null
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'vendor'
        })
        .select()
        .single();

      if (roleError && roleError.code !== '23505') {
        console.error('Error assigning vendor role:', roleError);
      }

      toast({
        title: "Invitation Accepted",
        description: `You are now a ${invitation.role} at ${invitation.vendor_name}`
      });

      return true;
    } catch (err) {
      console.error('Error accepting invitation:', err);
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const declineInvitation = async () => {
    if (!invitation) return false;

    try {
      const { error } = await supabase
        .from('vendor_team_members')
        .update({
          status: 'inactive',
          invitation_token: null
        })
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: "Invitation Declined",
        description: "You have declined this invitation"
      });

      return true;
    } catch (err) {
      console.error('Error declining invitation:', err);
      toast({
        title: "Error",
        description: "Failed to decline invitation",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    loading,
    invitation,
    error,
    acceptInvitation,
    declineInvitation
  };
};
