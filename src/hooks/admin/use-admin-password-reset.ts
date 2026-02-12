import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useAdminPasswordReset() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetUserPassword = async (userEmail: string, newPassword: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { userEmail, newPassword }
      });

      if (error) {
        throw new Error(error.message || 'Failed to reset password');
      }

      if (data?.success) {
        toast({
          title: 'Password Reset Successful',
          description: `Password has been reset for ${userEmail}. User can now log in with the new password.`,
        });
        return { success: true };
      } else {
        throw new Error(data?.error || 'User not found');
      }
    } catch (error: any) {
      toast({
        title: 'Password Reset Failed',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    resetUserPassword,
    loading,
  };
}