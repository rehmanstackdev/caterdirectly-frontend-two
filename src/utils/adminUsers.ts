export interface AdminUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  console.log('API Call: GET', { url: '/admin/users', roles: ['admin', 'super-admin'] });
  console.log('API Call Complete: GET', { url: '/admin/users', result: [] });
  return [];
}
