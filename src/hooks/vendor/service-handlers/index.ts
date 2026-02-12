
import { useDraftHandler } from './use-draft-handler';
import { useApprovalHandler } from './use-approval-handler';

export function useServiceHandlers() {
  const { isSubmitting: isDraftSubmitting, handleSaveDraft } = useDraftHandler();
  const { isSubmitting: isApprovalSubmitting, handleSubmitForApproval } = useApprovalHandler();

  // Combine the isSubmitting states
  const isSubmitting = isDraftSubmitting || isApprovalSubmitting;

  return {
    isSubmitting,
    handleSaveDraft,
    handleSubmitForApproval
  };
}
