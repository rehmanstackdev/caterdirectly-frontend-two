import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface InviteData {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
}

export const useVendorTeam = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch team members
  const fetchTeamMembers = async () => {
    const vendorId = await getVendorId();
    if (!vendorId) return;

    const { data, error } = await supabase
      .from('vendor_team_members')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team members:', error);
      return;
    }

    setTeamMembers(data as TeamMember[] || []);
  };

  // Invite team member
  const inviteMember = async (inviteData: InviteData) => {
    const vendorId = await getVendorId();
    if (!vendorId) {
      toast({
        title: "Error",
        description: "Unable to find vendor information",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Generate secure token and expiry
      const invitationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to accept

      const { data: newMember, error } = await supabase
        .from('vendor_team_members')
        .insert({
          vendor_id: vendorId,
          email: inviteData.email,
          name: inviteData.name,
          role: inviteData.role,
          invited_by: user?.id,
          invitation_token: invitationToken,
          invitation_expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Get vendor and inviter details
      const { data: vendor } = await supabase
        .from('vendors')
        .select('company_name')
        .eq('id', vendorId)
        .single();

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user?.id)
        .single();

      const inviterName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();

      // Call edge function to send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-team-invitation', {
        body: {
          teamMemberId: newMember.id,
          vendorName: vendor?.company_name || 'Your vendor',
          inviterName: inviterName || 'A team member'
        }
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
      }

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteData.email}`
      });

      await fetchTeamMembers();
      return true;
    } catch (error: any) {
      console.error('Error inviting team member:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "This email is already part of your team",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send invitation. Please try again.",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  // Remove team member
  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Member Removed",
        description: "Team member has been removed from your account"
      });

      // Refresh team members
      await fetchTeamMembers();
      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Toggle member status
  const toggleMemberStatus = async (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const { error } = await supabase
        .from('vendor_team_members')
        .update({ status: newStatus })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Team member status changed to ${newStatus}`
      });

      // Refresh team members
      await fetchTeamMembers();
      return true;
    } catch (error) {
      console.error('Error updating member status:', error);
      toast({
        title: "Error",
        description: "Failed to update member status. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Initialize data
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchTeamMembers().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    teamMembers,
    loading,
    inviteMember,
    removeMember,
    toggleMemberStatus,
    refetch: fetchTeamMembers
  };
};