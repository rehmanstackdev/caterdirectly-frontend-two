
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { clearLogoutMarker } from "@/utils/session-manager";

// Auth response type with bypass information
export interface SignInResponse {
  success: boolean;
  error?: string;
  bypassAuth?: boolean;
  adminEmail?: string;
  message?: string;
  timestamp?: number;
}

// Helper to get client IP address (best effort)
const getClientIP = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    const data = await response.json();
    return data.ip || null;
  } catch (error) {
    console.warn('Could not fetch client IP:', error);
    return null;
  }
};

// Log login attempt to console for security monitoring
const logLoginAttempt = async (
  email: string,
  success: boolean,
  errorMessage?: string,
  errorCode?: string,
  userId?: string
) => {
  try {
    const ipAddress = await getClientIP();
    const userAgent = navigator.userAgent;

    console.log('Login attempt:', {
      email: email.toLowerCase().trim(),
      success,
      error_message: errorMessage || null,
      error_code: errorCode || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      user_id: userId || null,
    });
  } catch (error) {
    // Don't fail login if logging fails
    console.error('Failed to log login attempt:', error);
  }
};

export const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signIn = async (email: string, password: string): Promise<SignInResponse> => {
    try {
      // Clear logout marker on legitimate sign-in attempt
      clearLogoutMarker();
      
      setLoading(true);
      console.log("Sign-in attempt for:", email);
      
      const normalizedEmail = email.toLowerCase().trim();
      
      console.log('Attempting login to:', '/auth/login');
      console.log('Payload:', { email: normalizedEmail, password: '***', role: 'super_admin' });
      
      // Call backend API for authentication
      const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          role: 'super_admin',
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Get response text first to see what we're getting
      const responseText = await response.text();
      console.log('Response body:', responseText);
      
      // Try to parse as JSON
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        return {
          success: false,
          error: `Server returned invalid response: ${responseText.substring(0, 100)}`
        };
      }

      console.log('Parsed response:', responseData);

      // Check if login was successful (status 200 and message "Login successful")
      if (response.status !== 200 || responseData.message !== 'Login successful') {
        console.error("Sign in error:", responseData.message);
        
        // Use the exact API error message or fallback
        let userMessage = responseData.message || responseData.error || "Sign-in failed. Please try again.";
        
        // Log failed attempt
        await logLoginAttempt(
          normalizedEmail,
          false,
          responseData.message,
          response.status.toString()
        );
        
        return { success: false, error: userMessage };
      }

      console.log("Sign-in successful for:", email);
      console.log("User data:", responseData.data.user);
      
      // Store auth token
      if (responseData.data?.token) {
        localStorage.setItem('auth_token', responseData.data.token);
        console.log('Token stored in localStorage');
      }
      
      // Store user data
      if (responseData.data?.user) {
        localStorage.setItem('user_data', JSON.stringify(responseData.data.user));
        console.log('User data stored in localStorage');
      }
      
      // Store role (extract from roles array)
      if (responseData.data?.role) {
        localStorage.setItem('user_role', responseData.data.role);
        console.log('User role stored:', responseData.data.role);
      } else if (responseData.data?.user?.roles && responseData.data.user.roles.length > 0) {
        const role = responseData.data.user.roles[0].role;
        localStorage.setItem('user_role', role);
        console.log('User role stored from roles array:', role);
      }
      
      // Log successful attempt
      await logLoginAttempt(
        normalizedEmail,
        true,
        undefined,
        undefined,
        responseData.data?.user?.id
      );
      
      // Dispatch custom event to notify AuthProvider of state change
      window.dispatchEvent(new Event('auth-state-changed'));
      console.log('Dispatched auth-state-changed event');
      
      return { success: true };
    } catch (error) {
      console.error("Unexpected auth error:", error);
      
      // Check if it's a CORS or network error
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = "Cannot connect to the server. Please check if the backend is running at http://localhost:3000 and CORS is configured correctly.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Log unexpected error
      await logLoginAttempt(
        email.toLowerCase().trim(),
        false,
        error instanceof Error ? error.message : 'Unexpected error'
      );
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    loading,
    setLoading
  };
};
