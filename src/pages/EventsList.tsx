
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Dashboard from '@/components/dashboard/Dashboard';
import EventsListComponent from '@/components/events/EventsList';
import { useEvents } from '@/hooks/events';

const EventsList = () => {
  // Reuse the existing events hook
  const { events, isLoading } = useEvents();
  
  return (
    <Dashboard activeTab="events" userRole="event-host">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Events</h1>
        <EventsListComponent events={events} isLoading={isLoading} />
      </div>
    </Dashboard>
  );
};

export default EventsList;
