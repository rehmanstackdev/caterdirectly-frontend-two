import React from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import HostReviewsOverview from '@/components/host/HostReviewsOverview';

const HostReviewsPage = () => {
  return (
    <Dashboard activeTab="reviews" userRole="event-host">
      <HostReviewsOverview />
    </Dashboard>
  );
};

export default HostReviewsPage;