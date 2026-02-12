import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

export function useAuthValidation() {
  const { user, userRole, loading } = useAuth();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Reset error state when loading
    if (loading) {
      setAuthError(null);
      return;
    }

    // Check for authenticated user without role
    if (user && !userRole) {
      const errorMessage = "Your account is missing role permissions. Please contact support.";
      setAuthError(errorMessage);
      
      toast({
        title: "Authentication Issue",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      setAuthError(null);
    }
  }, [user, userRole, loading, toast]);

  return {
    authError,
    isAuthenticated: !!user,
    hasRole: !!userRole,
    isLoading: loading
  };
}