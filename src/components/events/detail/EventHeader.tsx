
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit, Link } from 'lucide-react';
import { Event } from '@/types/order';

interface EventHeaderProps {
  event: Event;
}

const EventHeader = ({ event }: EventHeaderProps) => {
  const navigate = useNavigate();
  
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <p className="text-gray-500 mt-1">
          {formatDate(event.startDate)} • {formatTime(event.startDate)}
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/events/${event.id}/edit`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Event
        </Button>
        <Button
          onClick={() => navigate(`/events/${event.id}/rsvp-page`)}
        >
          <Link className="mr-2 h-4 w-4" />
          View RSVP Page
        </Button>
      </div>
    </div>
  );
};

export default EventHeader;
