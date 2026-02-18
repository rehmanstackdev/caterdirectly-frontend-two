import { Event, EventGuest } from '@/types/order';
import EventsService from '@/services/api/host/events.Service';

export const EventsAPI = {
  // Get all events
  getEvents: async (_hostId?: string): Promise<Event[]> => {
    try {
      const response = await EventsService.getHostEvents();
      const payload = response?.data ?? response;
      const rows = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      const now = new Date();

      const normalizedEvents: Event[] = rows.map((event: any) => {
        const startDate = event?.startDateTime || event?.startDate || event?.date;
        const endDate = event?.endDateTime || event?.endDate || startDate;
        const startDateObj = new Date(startDate);

        return {
          ...event,
          category: !Number.isNaN(startDateObj.getTime()) && startDateObj < now ? 'past' : 'upcoming',
          startDate,
          endDate,
          date: startDate,
          image: event?.eventImage || event?.image,
          venueName: event?.venueName || event?.venueNameOptional || '',
          location: event?.venueAddress || event?.venueName || event?.venueNameOptional || '',
          guests: Array.isArray(event?.guests) ? event.guests : [],
          ticketTypes: Array.isArray(event?.tickets)
            ? event.tickets.map((t: any) => ({
                id: t?.id,
                name: t?.ticketName || '',
                price: Number(t?.price || 0),
                quantity: t?.quantityAvailable,
                description: t?.description,
                sold: t?.sold,
              }))
            : event?.ticketTypes || [],
          isTicketed: event?.isPaid ?? event?.isTicketed ?? false,
        } as Event;
      });

      return normalizedEvents;
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
    const response = await EventsService.updateEvent(eventId, updates);
    const payload = response?.data ?? response;
    const eventData = payload?.data ?? payload;

    const startDate = eventData?.startDateTime || eventData?.startDate || updates.startDate || new Date().toISOString();
    const endDate = eventData?.endDateTime || eventData?.endDate || updates.endDate || startDate;

    return {
      ...eventData,
      id: eventData?.id || eventId,
      title: eventData?.title || updates.title || '',
      description: eventData?.description || updates.description || '',
      date: startDate as any,
      startDate,
      endDate,
      image: eventData?.eventImage || eventData?.image || updates.image || '',
      venueName: eventData?.venueName || eventData?.venueNameOptional || updates.venueName || '',
      location: eventData?.venueAddress || eventData?.venueName || updates.location || '',
      guests: Array.isArray(eventData?.guests) ? eventData.guests : updates.guests || [],
      isTicketed: eventData?.isPaid ?? eventData?.isTicketed ?? updates.isTicketed ?? false,
      ticketTypes: Array.isArray(eventData?.tickets)
        ? eventData.tickets.map((t: any) => ({
            id: t?.id,
            name: t?.ticketName || '',
            price: Number(t?.price || 0),
            quantity: t?.quantityAvailable,
            description: t?.description,
            sold: t?.sold,
          }))
        : updates.ticketTypes || [],
    } as Event;
  },
  // Delete event
  deleteEvent: async (eventId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await EventsService.deleteEvent(eventId);
    const payload = response?.data ?? response;
    const message = payload?.message || payload?.data?.message;

    return {
      success: true,
      ...(message ? { message } : {}),
    };
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

