
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import MetaTags from "@/components/shared/MetaTags";
import { useEvents } from "@/hooks/events/use-events";

const EventDetailPage = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const { events, isLoading } = useEvents();
  
  // Find the event based on the eventId parameter
  const event = events.find(e => e.id === eventId);
  
  useEffect(() => {
    if (event) {
      console.log('EventDetailPage: Event loaded', { 
        id: event.id, 
        title: event.title,
        hasImage: !!event.image,
        imageUrl: event.image
      });
    }
  }, [event]);
  
  // Set meta tags based on the event details
  const eventTitle = event ? `${event.title} - CaterDirectly Event` : "Event Details - CaterDirectly";
  const eventDescription = event ? 
    `Join us for ${event.title}${event.location ? ` at ${event.location}` : ''} on ${new Date(event?.startDate || '').toLocaleDateString()}` : 
    "Event details on CaterDirectly - Find and book events near you";
  const eventImage = event?.image || "/lovable-uploads/5a0003fb-1412-482d-a6cb-4352fc398d2d.png";
  
  return (
    <>
      <MetaTags
        title={eventTitle}
        description={eventDescription}
        image={eventImage}
        type="event"
      />
      {/* Rest of EventDetailPage component */}
    </>
  );
};

export default EventDetailPage;
