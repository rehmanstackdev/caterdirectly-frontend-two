import { supabase } from "@/integrations/supabase/client";
import { markLoggedOut } from "@/utils/session-manager";
import { toast } from "sonner";

export const useSignOut = () => {
  const signOut = async () => {
    try {
      console.log('useSignOut: Starting sign out process');
      
      // POISON PILL: Mark this as intentional logout BEFORE clearing storage
      markLoggedOut();
      console.log('Logout marker set');
      
      // ENTERPRISE STRATEGY: Clear storage FIRST (prevent Supabase from restoring)
      // Clear ALL localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      console.log('All storage cleared before signOut');
      
      // Step 2: NOW call Supabase signOut (nothing left to restore)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
      }
      
      console.log("User signed out successfully");
      
      // Show success toast
      toast.success("Logged Out", {
        description: "You have been successfully logged out.",
      });
      
      // Step 3: Redirect to landing page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error) {
      console.error("Error during sign out:", error);
      // Force navigation to landing page even on error
      window.location.href = '/';
    }
  };

  return { signOut };
};