

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import EventStatCard from './EventStatCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface EventStats {
  totalGuests?: number;
  confirmed?: number;
  pending?: number;
  declined?: number;
  responseRate?: number;
  revenue?: number;
}

interface EventStatsCardProps {
  stats: EventStats;
  isTicketed: boolean;
  handleSendReminders: () => void;
}

const EventStatsCard = ({
  stats,
  isTicketed,
  handleSendReminders
}: EventStatsCardProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="overflow-hidden h-full">
      <CardContent className={`p-2 sm:p-3 md:p-4 ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
        <h4 className="font-semibold text-base mb-2 sm:mb-3">Response Stats</h4>
        
        <div className="space-y-1 sm:space-y-2">
          <EventStatCard label="Total Invited" value={stats?.totalGuests || 0} />
          <EventStatCard 
            label="Confirmed" 
            value={stats?.confirmed || 0}
            valueClassName="font-medium text-green-600" 
          />
          <EventStatCard 
            label="Pending" 
            value={stats?.pending || 0}
            valueClassName="font-medium text-amber-600" 
          />
          <EventStatCard 
            label="Declined" 
            value={stats?.declined || 0}
            valueClassName="font-medium text-red-600" 
          />
          <EventStatCard 
            label="Response Rate" 
            value={`${Math.round(stats?.responseRate || 0)}%`} 
          />
          
          {isTicketed && (
            <div className="border-t pt-2 mt-2">
              <EventStatCard 
                label="Revenue" 
                value={`$${((stats?.revenue || 0) / 100).toFixed(2)}`} 
              />
            </div>
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-2 sm:mt-3 h-8 text-xs"
          onClick={handleSendReminders}
          disabled={!stats?.pending}
          size="sm"
        >
          <Mail className="mr-1 h-3 w-3" />
          {isMobile ? "Remind" : "Send Reminders"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventStatsCard;
