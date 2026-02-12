import { useEffect, useMemo, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { useSignIn } from "@/hooks/auth/use-sign-in";
import { useSignUp } from "@/hooks/auth/use-sign-up";
import { useSignOut } from "@/hooks/auth/use-sign-out";
import { useSessionManagement } from "@/hooks/auth/use-session-management";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use extracted hooks for session and bypass management
  const { 
    user, 
    session, 
    userRole,
    loading, 
    initializeAuthState 
  } = useSessionManagement();
  
  
  // Import authentication hooks
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { signOut: baseSignOut } = useSignOut();
  
  // KISS: Simple sign out without bypass complexity
  const signOut = async () => {
    try {
      await baseSignOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  };

  // Initialize authentication state
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("AuthProvider: Initializing auth state");
    }
    // Call initializeAuthState and get the cleanup function
    const cleanup = initializeAuthState();
    
    // Return the cleanup function
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [initializeAuthState]);

  // Create context value with all auth related data and methods
  // Memoized to prevent unnecessary re-renders of all useAuth() consumers
  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      userRole,
      signIn,
      signUp,
      signOut
    }),
    [user, session, loading, userRole, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
