
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types/order";
import { EventsAPI } from "@/api/events";
import { useAuth } from "@/contexts/auth";

export type EventTabType = 'upcoming' | 'past' | 'draft';

export const useEvents = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<EventTabType>("upcoming");
  
  // Fetch events with React Query
  const { 
    data: events = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: () => EventsAPI.getEvents(user?.id),
    enabled: !!user?.id
  });
  
  // Filter events directly
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    
    switch (activeTab) {
      case 'upcoming':
        return events.filter(event => (event as any).category === 'upcoming');
      case 'past':
        return events.filter(event => (event as any).category === 'past');
      case 'draft':
        return events.filter(event => event.status === 'draft');
      default:
        return events;
    }
  }, [events, activeTab]);
  
  return {
    events: events || [],
    filteredEvents,
    activeTab,
    setActiveTab,
    isLoading,
    error
  };
};

