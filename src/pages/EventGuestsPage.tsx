
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { useEvents } from '@/hooks/events/use-events';
import EventGuestManagement from '@/components/events/guests/EventGuestManagement';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import MetaTags from '@/components/shared/MetaTags';

const EventGuestsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { events, isLoading } = useEvents();
  
  // Find the event based on the eventId parameter
  const event = events.find(e => e.id === eventId);
  
  // Set meta tags based on the event details
  const guestPageTitle = event ? `Guest List for ${event.title} - CaterDirectly` : "Event Guest Management - CaterDirectly";
  const guestPageDescription = event ? 
    `Manage the guest list for ${event.title} event on CaterDirectly.` : 
    "Manage your event guests on CaterDirectly";
  
  if (isLoading) {
    return (
      <Dashboard activeTab="analytics" userRole="event-host">
        <MetaTags title="Loading Event Guests - CaterDirectly" />
        <div className="h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-[#F07712]" />
            <p className="text-gray-500">Loading event details...</p>
          </div>
        </div>
      </Dashboard>
    );
  }
  
  if (!event) {
    return (
      <Dashboard activeTab="analytics" userRole="event-host">
        <MetaTags title="Event Not Found - CaterDirectly" />
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Link to="/host/dashboard">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-lg font-semibold text-gray-700">Event not found</p>
                <p className="text-gray-500 mt-2">The event you're looking for doesn't exist or you don't have access.</p>
                <Button className="mt-4" asChild>
                  <Link to="/host/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Dashboard>
    );
  }
  
  return (
    <Dashboard activeTab="analytics" userRole="event-host">
      <MetaTags
        title={guestPageTitle}
        description={guestPageDescription}
        image={event.image || undefined}
      />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to={`/events/${eventId}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Event
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Guest Management</h1>
          <div /> {/* Empty div for flex justification */}
        </div>
        
        <EventGuestManagement event={event} />
      </div>
    </Dashboard>
  );
};

export default EventGuestsPage;
