
import { useMemo, useState } from 'react';
import { Event } from '@/types/order';

export type EventTabType = 'upcoming' | 'past' | 'draft' | 'all';

export const useEventFilters = (events: Event[], defaultActiveTab: EventTabType = 'upcoming') => {
  const [activeTab, setActiveTab] = useState<EventTabType>(defaultActiveTab);
  
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) {
      return [];
    }
    
    switch (activeTab) {
      case 'upcoming':
        // Use backend categorization for active/upcoming events
        return events.filter(event => (event as any).category === 'upcoming');
        
      case 'past':
        // Use backend categorization for past events
        return events.filter(event => (event as any).category === 'past');
        
      case 'draft':
        // Filter draft events (events without proper dates or marked as draft)
        return events.filter(event => 
          event.status === 'draft' || 
          (!event.startDate && !event.endDate)
        );
        
      case 'all':
      default:
        return events;
    }
  }, [events, activeTab]);
  
  return { filteredEvents, activeTab, setActiveTab };
};
