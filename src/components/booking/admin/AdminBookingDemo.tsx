import React, { useState } from 'react';
import { ServiceSelection } from '@/types/order';
import { CustomAdjustment } from '@/types/adjustments';
import AdminCustomAdjustments from './AdminCustomAdjustments';
import EnhancedOrderSummaryCard from '../order-summary/EnhancedOrderSummaryCard';
import { useUserRole } from '@/hooks/use-user-role';

interface AdminBookingDemoProps {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  formData: any;
  draftId?: string | null;
}

const AdminBookingDemo = ({
  selectedServices,
  selectedItems,
  formData,
  draftId
}: AdminBookingDemoProps) => {
  const { isAdmin } = useUserRole();
  const [customAdjustments, setCustomAdjustments] = useState<CustomAdjustment[]>([]);
  const [isTaxExempt, setIsTaxExempt] = useState(false);
  const [isServiceFeeWaived, setIsServiceFeeWaived] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  if (!isAdmin) {
    return (
      <EnhancedOrderSummaryCard
        selectedServices={selectedServices}
        selectedItems={selectedItems}
        customAdjustments={customAdjustments}
        showDetailedBreakdown={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Controls */}
      <AdminCustomAdjustments
        selectedServices={selectedServices}
        selectedItems={selectedItems}
        formData={formData}
        draftId={draftId}
        adjustments={customAdjustments}
        onChange={setCustomAdjustments}
        isTaxExempt={isTaxExempt}
        isServiceFeeWaived={isServiceFeeWaived}
        adminNotes={adminNotes}
        onTaxExemptChange={setIsTaxExempt}
        onServiceFeeWaivedChange={setIsServiceFeeWaived}
        onAdminNotesChange={setAdminNotes}
      />

      {/* Order Summary with Admin Overrides */}
      <EnhancedOrderSummaryCard
        selectedServices={selectedServices}
        selectedItems={selectedItems}
        customAdjustments={customAdjustments}
        isTaxExempt={isTaxExempt}
        isServiceFeeWaived={isServiceFeeWaived}
        showDetailedBreakdown={true}
      />
    </div>
  );
};

export default AdminBookingDemo;