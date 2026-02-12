
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to request a password reset email using the server-side flow:
 *  - Calls public.request_password_reset(email) which creates a token
 *  - Trigger sends email immediately using the centralized site_url
 */
export function usePasswordReset() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const requestPasswordReset = async (email: string) => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return { success: false, error: "Invalid email" };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("request_password_reset", {
        user_email: email,
      });

      if (error) {
        console.error("[usePasswordReset] request_password_reset error:", error);
        toast({
          title: "Request failed",
          description: "We couldn't start your password reset. Please try again.",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      if (data === true) {
        toast({
          title: "Check your inbox",
          description: "If an account exists for that email, a reset link has been sent.",
        });
        return { success: true };
      } else {
        // Function returns false if no user is found (we still show neutral message)
        toast({
          title: "Check your inbox",
          description: "If an account exists for that email, a reset link has been sent.",
        });
        return { success: true };
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    requestPasswordReset,
  };
}
