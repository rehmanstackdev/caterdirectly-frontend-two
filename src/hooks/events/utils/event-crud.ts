
import { Event, EventGuest } from "@/types/order";

// Event CRUD Operations
export const addEvent = (events: Event[], event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newEvent: Event = {
    ...event,
    id: `event-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return [newEvent, ...events];
};

export const updateEvent = (events: Event[], eventId: string, updates: Partial<Event>) => {
  return events.map(event => 
    event.id === eventId 
      ? { ...event, ...updates, updatedAt: new Date().toISOString() } 
      : event
  );
};

export const deleteEvent = (events: Event[], eventId: string) => {
  return events.filter(event => event.id !== eventId);
};

export const getEventById = (events: Event[], eventId: string) => {
  return events.find(event => event.id === eventId);
};
