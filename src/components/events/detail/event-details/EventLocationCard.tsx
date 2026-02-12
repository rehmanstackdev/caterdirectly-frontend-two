

import { Card, CardContent } from '@/components/ui/card';

interface EventLocationCardProps {
  location: string;
}

const EventLocationCard = ({ location }: EventLocationCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-medium">Location</div>
        <div className="text-gray-500 mt-1">{location}</div>
      </CardContent>
    </Card>
  );
};

export default EventLocationCard;
