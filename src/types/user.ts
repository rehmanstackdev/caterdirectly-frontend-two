import type { UserRole } from '@/types/supabase-types';

export type PlatformUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  jobTitle: string | null;
  userType: string | null;
  profileImage: string | null;
  roles: UserRole[];
  permissions?: Array<{
    id: string;
    permission: string;
    createdAt: string;
    updatedAt: string;
  }>;
  joinedAt: string | null;
  lastActive: string | null;
};
