import { Calendar, Clock, MapPin, User, Edit2, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/glass-ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface CalendarEventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    event_type: string;
    color?: string;
    created_by: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CalendarEventCard({ event, onEdit, onDelete }: CalendarEventCardProps) {
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  
  const getEventTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      order: 'bg-blue-500/20 text-blue-700',
      meeting: 'bg-purple-500/20 text-purple-700',
      deadline: 'bg-red-500/20 text-red-700',
      other: 'bg-gray-500/20 text-gray-700',
    };
    return colors[type] || colors.other;
  };

  return (
    <GlassCard className="p-4 hover:shadow-glass-hover transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div 
            className="w-1 h-16 rounded-full" 
            style={{ backgroundColor: event.color || '#3B82F6' }}
          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
            <Badge className={getEventTypeBadgeColor(event.event_type)}>
              {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(event.id)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(event.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {event.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {event.description}
        </p>
      )}

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{format(startDate, 'MMM dd, yyyy')}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
          </span>
        </div>
        
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
