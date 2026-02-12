import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthTestButtonsProps {
  className?: string;
}

export function AuthTestButtons({ className }: AuthTestButtonsProps) {
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();
  
  const testTandooriLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'hello@tandoorilife.com',
        password: 'tandoori123'
      });
      
      if (error) {
        toast({
          title: "Test Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Test Login Successful",
          description: "Tandoori Life vendor logged in successfully!",
        });
      }
    } catch (error) {
      console.error('Test login error:', error);
      toast({
        title: "Test Login Error",
        description: "An unexpected error occurred during test login.",
        variant: "destructive",
      });
    }
  };
  
  const testSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Test Sign Out",
        description: "Successfully signed out!",
      });
    } catch (error) {
      console.error('Test sign out error:', error);
      toast({
        title: "Sign Out Error",
        description: "An error occurred during sign out.",
        variant: "destructive",
      });
    }
  };
  
  const checkEmailStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('email_queue')
        .select('status, template_name, created_at')
        .eq('recipient_email', 'hello@tandoorilife.com')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        toast({
          title: "Email Status",
          description: `Latest email status: ${data[0].status} (${data[0].template_name})`,
        });
      } else {
        toast({
          title: "Email Status",
          description: "No emails found for Tandoori Life",
        });
      }
    } catch (error) {
      console.error('Email status check error:', error);
      toast({
        title: "Email Check Error",
        description: "Could not check email status.",
        variant: "destructive",
      });
    }
  };
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className={`p-4 border rounded-lg bg-muted ${className}`}>
      <h3 className="text-sm font-medium mb-3">Auth Test Controls (Dev Only)</h3>
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">
          Current: {user ? `${user.email} (${userRole || 'no role'})` : 'Not logged in'}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={testTandooriLogin} variant="outline">
            Test Tandoori Login
          </Button>
          <Button size="sm" onClick={testSignOut} variant="outline">
            Test Sign Out
          </Button>
          <Button size="sm" onClick={checkEmailStatus} variant="outline">
            Check Email Status
          </Button>
        </div>
      </div>
    </div>
  );
}