import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CreateEventRequest {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  eventType: string;
  venueName?: string;
  venueNameOptional?: string;
  venueAddress?: string;
  latitude?: number;
  longitude?: number;
  eventImage?: string;
  capacity?: number;
  website?: string;
  isPublic?: boolean;
  isPaid?: boolean;
  parkingInfo?: string;
  specialInstructions?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedInUrl?: string;
  themeColor?: string;
  visibility?: string;
}

interface CreateEventResponse {
  status: number;
  response: string;
  message: string;
  data: {
    id: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
    eventType: string;
    description?: string;
    themeColor?: string;
    visibility?: string;
    createdBy: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

interface BackendEvent {
  id: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  eventType: string;
  description?: string;
  themeColor?: string;
  visibility?: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface EventsResponse {
  status: number;
  response: string;
  message: string;
  data: BackendEvent[];
}

export const useEventsByDateRange = (endDate: Date) => {
  return useQuery({
    queryKey: ['events-by-date-range', format(endDate, 'yyyy-MM-dd')],
    queryFn: async (): Promise<BackendEvent[]> => {
      console.log('[Fetch Events] Fetching events until:', format(endDate, 'yyyy-MM-dd'));
      
      const response = await api.get<EventsResponse>(
        `/events/by-date-range?endDate=${format(endDate, 'yyyy-MM-dd')}`
      );
      
      console.log('[Fetch Events] Backend response:', response);
      return response.data || [];
    },
    refetchInterval: 60000, // Refresh every minute
    retry: 3,
    retryDelay: 1000,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: CreateEventRequest): Promise<CreateEventResponse> => {
      // Validate required fields
      if (!eventData.title?.trim()) {
        throw new Error('Event title is required');
      }
      if (!eventData.startDateTime) {
        throw new Error('Start date and time is required');
      }
      if (!eventData.endDateTime) {
        throw new Error('End date and time is required');
      }
      
      console.log('[Create Event] Sending request:', eventData);
      
      const response = await api.post<CreateEventResponse>('/events/create', eventData);
      
      console.log('[Create Event] Backend response:', response);
      return response;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Event created successfully');
      
      // Invalidate calendar queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['events-by-date-range'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      
      console.log('[Create Event] Success:', data.data);
    },
    onError: (error: any) => {
      console.error('[Create Event] Error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to create event';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific HTTP status codes
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to create events.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid event data provided.';
      }
      
      toast.error(errorMessage);
    },
  });
};