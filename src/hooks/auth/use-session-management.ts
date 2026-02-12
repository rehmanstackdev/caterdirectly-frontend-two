import { useState, useEffect, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { resolveUserRole } from "@/utils/role-resolver";
import { wasLoggedOut, clearLogoutMarker } from "@/utils/session-manager";

export function useSessionManagement() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Function to load auth state from localStorage
  const loadAuthFromStorage = useCallback(() => {
    console.log("useSessionManagement: Loading authentication state from localStorage");
    
    // Check localStorage for auth data
    const authToken = localStorage.getItem('auth_token');
    const userDataStr = localStorage.getItem('user_data');
    const storedRole = localStorage.getItem('user_role');
    
    console.log("LocalStorage auth check:", {
      hasToken: !!authToken,
      hasUserData: !!userDataStr,
      role: storedRole
    });
    
    if (authToken && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        console.log("User data from localStorage:", userData);
        
        // Create a mock user object compatible with Supabase User type
        const mockUser = {
          id: userData.id,
          email: userData.email,
          user_metadata: {
            firstName: userData.firstName,
            lastName: userData.lastName,
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: userData.createdAt,
        } as User;
        
        setUser(mockUser);
        setUserRole(storedRole);
        setSession({ access_token: authToken } as Session);
        
        console.log("Auth state loaded from localStorage:", {
          userId: mockUser.id,
          email: mockUser.email,
          role: storedRole
        });
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setUser(null);
        setUserRole(null);
        setSession(null);
      }
    } else {
      console.log("No auth data in localStorage");
      setUser(null);
      setUserRole(null);
      setSession(null);
    }
  }, []);
  
  // Function to initialize auth state
  const initializeAuthState = useCallback(() => {
    console.log("useSessionManagement: Initializing authentication state");
    
    loadAuthFromStorage();
    setLoading(false);
    setInitializing(false);
    
    // Listen for custom auth events (when login happens in the same window)
    const handleAuthChange = () => {
      console.log("Auth change event detected, reloading auth state");
      loadAuthFromStorage();
    };
    
    window.addEventListener('auth-state-changed', handleAuthChange);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, [loadAuthFromStorage]);
  
  return {
    user,
    setUser,
    session, 
    setSession,
    userRole,
    initializing,
    loading,
    setLoading,
    initializeAuthState
  };
}
