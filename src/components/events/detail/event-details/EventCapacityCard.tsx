

import { Card, CardContent } from '@/components/ui/card';

interface EventCapacityCardProps {
  capacity: number;
}

const EventCapacityCard = ({ capacity }: EventCapacityCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-medium">Capacity</div>
        <div className="text-gray-500 mt-1">{capacity} guests</div>
      </CardContent>
    </Card>
  );
};

export default EventCapacityCard;
