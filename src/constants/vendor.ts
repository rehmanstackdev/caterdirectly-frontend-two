export const APPROVED_VENDOR_STATUSES = ['approved', 'active'] as const;
export const APPROVED_BRAND_STATUSES = ['approved'] as const;

export type ApprovedVendorStatus = typeof APPROVED_VENDOR_STATUSES[number];
export type ApprovedBrandStatus = typeof APPROVED_BRAND_STATUSES[number];

export const getApprovedVendorsDefinition = () =>
  `Approved vendors = vendors with status: ${APPROVED_VENDOR_STATUSES.join(', ')} + approved brands`;
