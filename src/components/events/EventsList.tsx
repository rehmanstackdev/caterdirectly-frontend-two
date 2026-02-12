import { useState } from 'react';
import { Event } from '@/types/order';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Link, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatEventDate, formatEventTime } from '@/hooks/events/utils/date-utils';
import { getServiceImageUrl } from '@/utils/image-utils';

interface EventsListProps {
  events: Event[];
  isLoading?: boolean;
}

const EventsList = ({ events, isLoading = false }: EventsListProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="h-40 bg-gray-200" />
            <CardContent className="p-4 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="flex justify-between pt-2">
                <div className="h-8 bg-gray-200 rounded w-1/4" />
                <div className="h-8 bg-gray-200 rounded w-1/4" />
                <div className="h-8 bg-gray-200 rounded w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No events found.</p>
        <Button 
          onClick={() => navigate('/events/create')}
          className="mt-4"
          variant="outline"
        >
          Create your first event
        </Button>
      </div>
    );
  }
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {events.map((event) => {
        const confirmedGuests = (event.guests || []).filter(g => g.rsvpStatus === 'confirmed').length;
        const totalGuests = (event.guests || []).length;
        const responseRate = totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0;
        
        // Resolve image URL using existing utility
        const imageUrl = getServiceImageUrl(event.image);
        
        return (
          <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            {/* <div className="h-40 overflow-hidden relative">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No Image</p>
                  </div>
                </div>
              )}
              {event.isTicketed && (
                <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                  Ticketed
                </div>
              )}
            </div> */}
            
            <CardContent className="p-3 sm:p-4 space-y-3 flex-grow flex flex-col">
              <div>
                <h3 className="font-bold text-base sm:text-lg line-clamp-2">{event.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{event.description}</p>
              </div>
              
              <div className="space-y-1 sm:space-y-2 text-sm flex-grow">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{formatEventDate(event.startDate || (event as any).startDateTime)} • {formatEventTime(event.startDate || (event as any).startDateTime)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{confirmedGuests} confirmed of {totalGuests} invited ({responseRate}%)</span>
                </div>
                
                {event.eventUrl && (
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <a href={event.eventUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                      {event.eventUrl.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
              
              {/* <div className="flex justify-between pt-2 gap-2 mt-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/events/${event.id}/guests`)}
                  className="px-2 sm:px-3 h-8"
                >
                  <Users className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Guests</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/events/${event.id}/send-invites`)}
                  className="px-2 sm:px-3 h-8"
                >
                  <Mail className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Invites</span>
                </Button>
                
                <Button 
                  size="sm"
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="bg-[#F07712] hover:bg-[#F07712]/90 text-white px-2 sm:px-3 h-8"
                >
                  Manage
                </Button>
              </div> */}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EventsList;
