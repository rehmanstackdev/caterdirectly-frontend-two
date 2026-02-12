

import { Card, CardContent } from '@/components/ui/card';

interface EventWebsiteCardProps {
  eventUrl: string;
}

const EventWebsiteCard = ({ eventUrl }: EventWebsiteCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-medium">Event Website</div>
        <a href={eventUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 block truncate">
          {eventUrl}
        </a>
      </CardContent>
    </Card>
  );
};

export default EventWebsiteCard;
