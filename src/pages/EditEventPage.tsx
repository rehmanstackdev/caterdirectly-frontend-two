
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/use-events';
import { useToast } from '@/components/ui/use-toast';
import Dashboard from '@/components/dashboard/Dashboard';
import { Separator } from '@/components/ui/separator';
import EventForm from '@/components/events/EventForm';
import { Event } from '@/types/order';

const EditEventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { events, updateEvent } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      // Find the event in our events array
      const foundEvent = events.find(e => e.id === eventId);
      
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        toast({
          title: "Event not found",
          description: "We couldn't find the event you're looking for.",
          variant: "destructive",
        });
        navigate('/host/dashboard');
      }
      
      setLoading(false);
    }
  }, [eventId, events, toast, navigate]);

  const handleUpdateEvent = (eventData: any) => {
    try {
      if (!eventId) return;
      
      // Format the data for update
      const formattedData = {
        ...eventData,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
      };
      
      updateEvent(eventId, formattedData);
      
      toast({
        title: "Event updated successfully",
        description: "Your event has been updated with the new information.",
      });
      
      navigate(`/events/${eventId}`);
    } catch (error) {
      toast({
        title: "Error updating event",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error("Event update error:", error);
    }
  };
  
  if (loading) {
    return (
      <Dashboard activeTab="analytics" userRole="event-host">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F50]"></div>
        </div>
      </Dashboard>
    );
  }
  
  if (!event) {
    return (
      <Dashboard activeTab="analytics" userRole="event-host">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold">Event not found</h2>
          <p className="mt-2 text-gray-600">We couldn't find the event you're looking for.</p>
        </div>
      </Dashboard>
    );
  }

  // Format dates and times for the form
  const initialData = {
    ...event,
    startDate: event.startDate instanceof Date 
      ? event.startDate.toISOString().split('T')[0] 
      : new Date(event.startDate).toISOString().split('T')[0],
    startTime: event.startDate instanceof Date
      ? event.startDate.toTimeString().split(' ')[0].substring(0, 5)
      : new Date(event.startDate).toTimeString().split(' ')[0].substring(0, 5),
    endDate: event.endDate instanceof Date 
      ? event.endDate.toISOString().split('T')[0] 
      : new Date(event.endDate).toISOString().split('T')[0],
    endTime: event.endDate instanceof Date
      ? event.endDate.toTimeString().split(' ')[0].substring(0, 5)
      : new Date(event.endDate).toTimeString().split(' ')[0].substring(0, 5),
  };
  
  return (
    <Dashboard activeTab="analytics" userRole="event-host">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-gray-500 mt-1">Update your event details</p>
        </div>
        
        <Separator />
        
        <EventForm 
          initialData={initialData} 
          onSubmit={handleUpdateEvent}
          isEditing={true} 
        />
      </div>
    </Dashboard>
  );
};

export default EditEventPage;
