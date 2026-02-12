
import { Vendor } from '@/components/admin/vendors/VendorTableRow';

export type VendorFilters = {
  searchQuery: string;
};

export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
