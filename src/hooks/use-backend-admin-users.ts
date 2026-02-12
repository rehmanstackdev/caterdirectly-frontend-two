import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

interface BackendAdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  roles: Array<{
    id: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface BackendAdminUsersResponse {
  status: number;
  response: string;
  message: string;
  data: BackendAdminUser[];
}

export const useBackendAdminUsers = () => {
  return useQuery({
    queryKey: ['backend-admin-users'],
    queryFn: async (): Promise<BackendAdminUser[]> => {
      const response = await api.get<BackendAdminUsersResponse>('/users/admins');
      return response.data || [];
    },
    staleTime: 600_000, // 10 minutes
    gcTime: 1200_000, // 20 minutes
  });
};