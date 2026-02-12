import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/api/client';

interface EditUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  userType: 'individual' | 'business';
  roles: Array<{
    role: string;
    enabled: boolean;
  }>;
  permissions: Array<{
    permission: string;
    enabled: boolean;
  }>;
  newPassword?: string;
}

export function useEditUser() {
  const [loading, setLoading] = useState(false);

  const editUser = async (userId: string, userData: EditUserData) => {
    setLoading(true);
    try {
      const payload: any = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        userType: userData.userType,
        roles: userData.roles,
        permissions: userData.permissions,
      };

      // Include optional fields only if they have values
      if (userData.phone) {
        payload.phone = userData.phone;
      }
      if (userData.jobTitle) {
        payload.jobTitle = userData.jobTitle;
      }
      // Only include newPassword if it's provided and not empty
      if (userData.newPassword && userData.newPassword.trim().length > 0) {
        payload.newPassword = userData.newPassword;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await api.patch(`/users/${userId}`, payload, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      toast.success(`User ${userData.firstName} ${userData.lastName} has been updated successfully.`);
      return { success: true, data: response };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update user';
        toast.error(errorMessage);
      }
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    editUser,
    loading,
  };
}

