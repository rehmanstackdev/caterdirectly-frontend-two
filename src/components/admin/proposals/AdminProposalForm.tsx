

import { InvoiceForm } from '@/components/shared/InvoiceForm';

interface AdminProposalFormProps {
  service?: any;
  onBack: () => void;
}

export const AdminProposalForm = ({ onBack }: AdminProposalFormProps) => {
  return (
    <InvoiceForm 
      userRole="admin"
      onBack={onBack}
    />
  );
};
