
import { Event } from '@/types/order';
import EventContentSection from './event-content/EventContentSection';
import EventDetailsSection from './event-details/EventDetailsSection';
import EventStatsCard from './event-stats/EventStatsCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface EventOverviewProps {
  event: Event;
  stats: any;
  handleSendReminders: () => void;
}

const EventOverview = ({ 
  event, 
  stats,
  handleSendReminders
}: EventOverviewProps) => {
  const isMobile = useIsMobile();
  
  // Convert string dates to Date objects if needed
  const getStartDate = (): Date => {
    return event.startDate instanceof Date ? event.startDate : new Date(event.startDate);
  };
  
  const getEndDate = (): Date => {
    return event.endDate instanceof Date ? event.endDate : new Date(event.endDate);
  };
  
  return (
    <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'md:grid-cols-3 gap-6'}`}>
      <div className="md:col-span-2 space-y-4 md:space-y-6">
        <EventContentSection 
          image={event.image} 
          title={event.title}
          description={event.description}
        />
        
        <EventDetailsSection 
          startDate={getStartDate()}
          endDate={getEndDate()}
          location={event.location}
          capacity={event.capacity}
          eventUrl={event.eventUrl}
        />
      </div>
      
      <div className="space-y-4 md:space-y-6">
        <EventStatsCard 
          stats={stats}
          isTicketed={event.isTicketed}
          handleSendReminders={handleSendReminders}
        />
      </div>
    </div>
  );
};

export default EventOverview;
