import { GlassCard } from '@/components/glass-ui/GlassCard';
import { GlassBadge } from '@/components/glass-ui/GlassBadge';
import { Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUpcomingEvents } from '@/hooks/calendar/useUpcomingEvents';
import { format } from 'date-fns';
import { GlassButton } from '@/components/glass-ui/GlassButton';

export function CalendarMiniWidget() {
  const navigate = useNavigate();
  const { events, loading: isLoading } = useUpcomingEvents();
  
  const upcomingEvents = events?.slice(0, 3) || [];

  const getEventTypeColor = (type: string): 'success' | 'warning' | 'info' => {
    switch (type) {
      case 'meeting': return 'info';
      case 'event': return 'success';
      case 'deadline': return 'warning';
      default: return 'info';
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-brand" />
          <h3 className="font-semibold text-lg">Upcoming Events</h3>
        </div>
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/calendar')}
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </GlassButton>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
              onClick={() => navigate('/admin/calendar')}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(event.start_time), 'MMM d, h:mm a')}
                  </p>
                </div>
                <GlassBadge
                  variant={getEventTypeColor(event.event_type)}
                  size="sm"
                  className="flex-shrink-0"
                >
                  {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                </GlassBadge>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming events</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
