import { Event, EventGuest } from '@/types/order';
import HostService from '@/services/api/host/host.Service';

export const EventsAPI = {
  // Get all events
  getEvents: async (hostId?: string): Promise<Event[]> => {
    try {
      if (!hostId) {
        console.warn('No host ID provided, returning empty events');
        return [];
      }
      
      console.log('EventsAPI - Calling getEventsByHost with hostId:', hostId);
      const response = await HostService.getEventsByHost(hostId);
      console.log('EventsAPI - Response:', response);
      const eventsData = response.data?.data || response.data || {};
      
      // Map backend events to frontend format and add category info
      const activeEvents = (eventsData.active || []).map((event: any) => ({
        ...event,
        category: 'upcoming',
        startDate: event.startDateTime,
        endDate: event.endDateTime,
        image: event.eventImage
      }));
      
      const pastEvents = (eventsData.past || []).map((event: any) => ({
        ...event,
        category: 'past',
        startDate: event.startDateTime,
        endDate: event.endDateTime,
        image: event.eventImage
      }));
      
      const allEvents = [...activeEvents, ...pastEvents];
      console.log('EventsAPI - Final events:', allEvents);
      return allEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },
  
  // Get event by ID
  getEvent: async (eventId: string): Promise<Event> => {
    console.log('API Call: GET', { url: `/events/${eventId}`, eventId });
    const result: Event = {
      id: `event-${Date.now()}`,
      title: '',
      description: '',
      date: new Date().toISOString(),
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      location: '',
      venueName: '',
      type: '',
      capacity: 0,
      guests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      image: '',
      eventUrl: '',
      isPublic: false,
      isTicketed: false,
      ticketTypes: [],
      host_id: 'mock-host-id'
    };
    console.log('API Call Complete: GET', { url: `/events/${eventId}`, result });
    return result;
  },
  
  // Create new event
  createEvent: async (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    console.log('API Call: POST', { url: '/events', data: event });
    const result: Event = {
      ...event,
      id: `event-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log('API Call Complete: POST', { url: '/events', result });
    return result;
  },
  
  // Update event
  updateEvent: async (eventId: string, updates: Partial<Event>): Promise<Event> => {
    console.log('API Call: PUT', { url: `/events/${eventId}`, eventId, data: updates });
    const result: Event = {
      id: eventId,
      title: updates.title || '',
      description: updates.description || '',
      date: updates.date || new Date().toISOString(),
      startDate: updates.startDate || new Date().toISOString(),
      endDate: updates.endDate || new Date().toISOString(),
      location: updates.location || '',
      venueName: updates.venueName || '',
      type: updates.type || '',
      capacity: updates.capacity || 0,
      guests: updates.guests || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: updates.status || 'draft',
      image: updates.image || '',
      eventUrl: updates.eventUrl || '',
      isPublic: updates.isPublic || false,
      isTicketed: updates.isTicketed || false,
      ticketTypes: updates.ticketTypes || [],
      host_id: updates.host_id || 'mock-host-id',
      ...updates
    };
    console.log('API Call Complete: PUT', { url: `/events/${eventId}`, result });
    return result;
  },
  
  // Delete event
  deleteEvent: async (eventId: string): Promise<{ success: boolean }> => {
    console.log('API Call: DELETE', { url: `/events/${eventId}`, eventId });
    const result = { success: true };
    console.log('API Call Complete: DELETE', { url: `/events/${eventId}`, result });
    return result;
  },
  
  // Add guest to event
  addGuest: async (eventId: string, guest: Pick<EventGuest, 'id' | 'name' | 'email' | 'rsvpStatus'>): Promise<EventGuest> => {
    console.log('API Call: POST', { url: `/events/${eventId}/guests`, eventId, data: guest });
    const result: EventGuest = {
      id: `guest-${Date.now()}`,
      name: guest.name,
      email: guest.email,
      rsvpStatus: guest.rsvpStatus || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log('API Call Complete: POST', { url: `/events/${eventId}/guests`, result });
    return result;
  },
  
  // Update guest RSVP status
  updateGuestRsvp: async (
    eventId: string, 
    guestId: string, 
    rsvpStatus: 'pending' | 'confirmed' | 'declined'
  ): Promise<EventGuest> => {
    console.log('API Call: PUT', { url: `/events/${eventId}/guests/${guestId}`, eventId, guestId, data: { rsvpStatus } });
    const result: EventGuest = {
      id: guestId,
      name: '',
      email: '',
      rsvpStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log('API Call Complete: PUT', { url: `/events/${eventId}/guests/${guestId}`, result });
    return result;
  },
  
  // Send reminder emails to guests
  sendReminders: async (eventId: string): Promise<{ success: boolean; message: string }> => {
    console.log('API Call: POST', { url: `/events/${eventId}/reminders`, eventId });
    const result = { success: true, message: 'Reminders sent successfully' };
    console.log('API Call Complete: POST', { url: `/events/${eventId}/reminders`, result });
    return result;
  }
};
