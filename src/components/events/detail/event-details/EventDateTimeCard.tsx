

import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EventDateTimeCardProps {
  startDate: Date;
  endDate: Date;
}

const EventDateTimeCard = ({ startDate, endDate }: EventDateTimeCardProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <Calendar className="h-6 w-6 text-gray-500" />
        <div>
          <div className="font-medium">Date & Time</div>
          <div className="text-gray-500">
            {formatDate(startDate)}
            <br />
            {formatTime(startDate)} - {formatTime(endDate)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventDateTimeCard;
