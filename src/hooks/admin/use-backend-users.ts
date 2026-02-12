import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import usersService from '@/services/api/admin/users.Service';
import { usersService as oldUsersService, type BackendUser, type BackendVendor } from '@/services/users.service';

export function useBackendUsers(page?: number, limit?: number) {
  return useQuery<{ users: BackendUser[]; pagination: any }>({
    queryKey: ['backend-users', page, limit],
    queryFn: async () => {
      const response = await usersService.getUsers(page, limit);
      const responseData = response?.data;
      const usersData = responseData?.data || response?.data || response;
      const paginationData = responseData?.pagination;

      return {
        users: Array.isArray(usersData) ? usersData : [],
        pagination: paginationData || null,
      };
    },
    staleTime: 60_000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: any) => {
      const result = await usersService.createUser(userData);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['backend-users'] });
      queryClient.invalidateQueries({ queryKey: ['backend-unified-entities'] });
      queryClient.invalidateQueries({ queryKey: ['backend-entity-counts'] });
      toast.success(result.message || 'User created successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      toast.error(errorMessage);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: any }) => {
      const result = await usersService.updateUser(userId, userData);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['backend-users'] });
      queryClient.invalidateQueries({ queryKey: ['backend-unified-entities'] });
      queryClient.invalidateQueries({ queryKey: ['backend-entity-counts'] });
      toast.success(result.message || 'User updated successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      toast.error(errorMessage);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await usersService.deleteUser(userId);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['backend-users'] });
      queryClient.invalidateQueries({ queryKey: ['backend-unified-entities'] });
      queryClient.invalidateQueries({ queryKey: ['backend-entity-counts'] });
      toast.success(result.message || 'User deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
    },
  });
}

export function useBackendVendors() {
  return useQuery<BackendVendor[]>({
    queryKey: ['backend-vendors'],
    queryFn: usersService.getAllVendors,
    staleTime: 60_000,
  });
}

export function useBackendVendor(id: string) {
  return useQuery<BackendVendor>({
    queryKey: ['backend-vendor', id],
    queryFn: () => usersService.getVendorById(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}