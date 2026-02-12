import { useState } from 'react';
import { toast } from 'sonner';
import UsersService from '@/services/api/admin/users.Service';

interface AddUserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  userType: string;
  phone?: string | null;
  jobTitle?: string | null;
}

export function useAddUser() {
  const [loading, setLoading] = useState(false);

  const addUser = async (userData: AddUserData) => {
    setLoading(true);
    try {
      const data = await UsersService.createUser(userData);
      toast.success(`${userData.firstName} ${userData.lastName} has been created successfully.`);
      return { success: true, data };
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    addUser,
    loading,
  };
}