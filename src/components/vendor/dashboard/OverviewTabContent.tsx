
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import QuickActionCards from './QuickActionCards';
import NewOrderRequests from '@/components/vendor/orders/NewOrderRequests';
import StaffBookingForm from '@/components/staffing/StaffBookingForm';

interface OverviewTabContentProps {
  setActiveTab: (tab: string) => void;
  hasActiveStaffingServices: boolean;
}

export const OverviewTabContent = ({ 
  setActiveTab,
  hasActiveStaffingServices
}: OverviewTabContentProps) => {
  return (
    <div className="space-y-6">
      <QuickActionCards setActiveTab={setActiveTab} />
      
      {/* New Order Requests */}
      <NewOrderRequests />
      
      {/* For staff vendors, conditionally show the staff booking form preview */}
      {hasActiveStaffingServices && (
        <Card>
          <CardHeader>
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Staff Service Preview</h3>
            <p className="text-sm text-muted-foreground">See how your staffing services are presented to clients</p>
          </CardHeader>
          <CardContent>
            <StaffBookingForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OverviewTabContent;
