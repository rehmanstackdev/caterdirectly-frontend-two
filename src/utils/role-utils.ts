/**
 * Utility functions for formatting role names for display
 */

/**
 * Get display name for a role enum value
 * Converts enum values like "super_admin" to "Super Admin"
 */
export const getRoleDisplayName = (role: string | null | undefined): string => {
  if (!role) return 'No Role';
  
  const roleLower = role.toLowerCase().trim();
  
  // Map role enum values to display names
  const roleNameMap: Record<string, string> = {
    'super_admin': 'Super Admin',
    'super-admin': 'Super Admin',
    'admin': 'Admin',
    'vendor': 'Vendor',
    'host': 'Host',
    'event-host': 'Event Host',
    'event_host': 'Event Host',
    'customer': 'Customer',
    'user': 'User',
  };
  
  // Check if we have a direct mapping
  if (roleNameMap[roleLower]) {
    return roleNameMap[roleLower];
  }
  
  // Fallback: format the role name nicely
  // Replace underscores and hyphens with spaces, then capitalize each word
  return role
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

