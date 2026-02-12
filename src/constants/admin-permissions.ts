/**
 * Single source of truth for admin page permissions
 * Each page in the admin dashboard is represented here
 */

export const ADMIN_PAGES = [
  { id: 'dashboard', name: 'Dashboard', category: 'Core' },
  { id: 'reports', name: 'Reports', category: 'Core' },
  { id: 'services', name: 'Services', category: 'Operations' },
  { id: 'vendors', name: 'Vendors', category: 'Operations' },
  { id: 'orders', name: 'Orders', category: 'Operations' },
  { id: 'proposals', name: 'Messages', category: 'Operations' },
  { id: 'users', name: 'Users', category: 'Support' },
  { id: 'support', name: 'Support', category: 'Support' },
  { id: 'finances', name: 'Finances', category: 'Accounting' },
  { id: 'invoices', name: 'Invoices', category: 'Accounting' },
  { id: 'leads', name: 'Leads', category: 'Sales' },
  { id: 'waitlist', name: 'Waitlist', category: 'Sales' },
  { id: 'config', name: 'Settings', category: 'System' },
  { id: 'security', name: 'Security', category: 'System' },
] as const;

export type PageId = typeof ADMIN_PAGES[number]['id'];

/**
 * Pages that are always accessible to all admins regardless of permissions
 */
export const DEFAULT_ACCESSIBLE_PAGES: PageId[] = ['dashboard', 'reports'];

/**
 * Pages that are locked to super-admins only
 */
export const SUPER_ADMIN_ONLY_PAGES: PageId[] = ['config', 'security'];
