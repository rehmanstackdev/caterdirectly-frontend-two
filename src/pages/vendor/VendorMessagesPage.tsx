
import { useState } from 'react';
import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import VendorMessagingHub from '@/components/vendor/messaging/VendorMessagingHub';

function VendorMessagesPage() {
  return (
    <VendorDashboard activeTab="messages">
      <div className="h-full">
        <VendorMessagingHub />
      </div>
    </VendorDashboard>
  );
};

export default VendorMessagesPage;
