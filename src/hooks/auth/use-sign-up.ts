import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSiteUrl } from "@/utils/adminSettings";
import { completeUserOnboarding } from "@/services/userOnboarding";

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      
      if (userData) {
        Object.keys(userData).forEach(key => {
          if (userData[key] instanceof File) {
            formData.append(key, userData[key]);
          } else {
            formData.append(key, userData[key]);
          }
        });
      }

      const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        return { success: false, error: responseData.message || 'Registration failed' };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    loading,
    setLoading
  };
};
