
import { Event, EventGuest } from "@/types/order";

export const addGuest = (events: Event[], eventId: string, guest: Pick<EventGuest, 'id' | 'name' | 'email' | 'rsvpStatus'>) => {
  const newGuest: EventGuest = {
    ...guest,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const updatedEvents = events.map(event => 
    event.id === eventId 
      ? { 
          ...event, 
          guests: [...event.guests, newGuest],
          updatedAt: new Date().toISOString()
        } 
      : event
  );
  
  return {
    updatedEvents,
    newGuest
  };
};

export const updateGuestRsvp = (events: Event[], eventId: string, guestId: string, rsvpStatus: 'pending' | 'confirmed' | 'declined') => {
  return events.map(event => 
    event.id === eventId 
      ? { 
          ...event, 
          guests: event.guests.map(guest => 
            guest.id === guestId 
              ? { ...guest, rsvpStatus, updatedAt: new Date().toISOString() } 
              : guest
          ),
          updatedAt: new Date().toISOString()
        } 
      : event
  );
};
