

import EventDateTimeCard from './EventDateTimeCard';
import EventLocationCard from './EventLocationCard';
import EventCapacityCard from './EventCapacityCard';
import EventWebsiteCard from './EventWebsiteCard';

interface EventDetailsSectionProps {
  startDate: Date;
  endDate: Date;
  location: string;
  capacity?: number;
  eventUrl?: string;
}

const EventDetailsSection = ({
  startDate,
  endDate,
  location,
  capacity,
  eventUrl
}: EventDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Event Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EventDateTimeCard startDate={startDate} endDate={endDate} />
        <EventLocationCard location={location} />
        
        {capacity && (
          <EventCapacityCard capacity={capacity} />
        )}
        
        {eventUrl && (
          <EventWebsiteCard eventUrl={eventUrl} />
        )}
      </div>
    </div>
  );
};

export default EventDetailsSection;
