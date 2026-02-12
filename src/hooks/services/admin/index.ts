
import { ServiceItem } from '@/types/service-types';
import { useApprovalFunctions } from './use-approval-functions';
import { useManagedStatus } from './use-managed-status';
import { useBulkManagedStatus } from './use-bulk-managed-status';

export function useServiceAdmin(
  updateService: (id: string, service: Partial<ServiceItem>) => Promise<ServiceItem | null>
) {
  const { approveService, rejectService } = useApprovalFunctions(updateService);
  const { toggleManagedStatus } = useManagedStatus(updateService);
  const { updateManagedStatusByVendor } = useBulkManagedStatus();

  return {
    approveService,
    rejectService,
    toggleManagedStatus,
    updateManagedStatusByVendor
  };
}
