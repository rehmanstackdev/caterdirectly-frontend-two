import { useQuery } from '@tanstack/react-query';
import { callRpc } from '@/utils/supabaseRpc';
import type { PlatformUser } from '@/types/user';
import type { UserRole } from '@/types/supabase-types';

// Map DB row (snake_case) to PlatformUser (camelCase)
function mapRow(row: any): PlatformUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name ?? null,
    lastName: row.last_name ?? null,
    phone: row.phone ?? null,
    jobTitle: row.job_title ?? null,
    userType: row.user_type ?? null,
    profileImage: row.profile_image ?? null,
    roles: (row.roles ?? []) as UserRole[],
    joinedAt: row.created_at ?? null,
    lastActive: row.last_active ?? null,
  };
}

export function useAdminUsers(search: string, limit = 100, offset = 0) {
  return useQuery<PlatformUser[], any>({
    queryKey: ['admin-users', { search, limit, offset }],
    queryFn: async () => {
      const { data, error } = await callRpc<{ search?: string; limit_count?: number; offset_count?: number }, any[]>(
        'admin_list_users',
        { search, limit_count: limit, offset_count: offset }
      );
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
    staleTime: 60_000,
  });
}
