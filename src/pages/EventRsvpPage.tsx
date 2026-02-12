import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEvents } from '@/hooks/use-events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import EventRsvpForm from '@/components/events/rsvp/EventRsvpForm';
import { formatEventDate, formatEventTime } from '@/hooks/events/utils/date-utils';
import { invitationService } from '@/services/invitation-service';
import { Loader } from 'lucide-react';

const EventRsvpPage = () => {
  const { eventId, token } = useParams<{ eventId?: string; token?: string }>();
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get('token');
  const activeToken = token || tokenFromQuery;
  
  const { events } = useEvents();
  const [isLoading, setIsLoading] = useState(true);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  
  // Fetch event data using either event ID or token
  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      try {
        let eventData = null;
        
        // If we have a token, use it to get the event details
        if (activeToken) {
          const validToken = await invitationService.validateToken(activeToken);
          if (!validToken) {
            setIsInvalidToken(true);
            setIsLoading(false);
            return;
          }
          
          setTokenData(validToken);
          eventData = await invitationService.getEventDetailsByToken(activeToken);
        } 
        // Otherwise use the event ID from URL or from events list
        else if (eventId) {
          eventData = events.find(e => e.id === eventId);
        }
        
        if (eventData) {
          setEvent(eventData);
        }
      } catch (error) {
        console.error('Error loading event details:', error);
      }
      setIsLoading(false);
    };
    
    fetchEventData();
  }, [activeToken, eventId, events]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-[#F07712]" />
          <p className="text-gray-500">Loading event details...</p>
        </div>
      </div>
    );
  }
  
  if (isInvalidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold">Invalid or Expired Link</h1>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500">
              The invitation link you're using is either invalid or has expired.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold">Event Not Found</h1>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500">
              The event you're looking for doesn't exist or has been cancelled.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Find guest info if token is available
  const guestInfo = tokenData ? event.guests.find(g => g.email === tokenData.email) : null;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          <div className="h-48 overflow-hidden">
            <img 
              src={event.image || "/lovable-uploads/5a0003fb-1412-482d-a6cb-4352fc398d2d.png"} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="text-gray-500 mt-1">
                {formatEventDate(event.startDate)} • {formatEventTime(event.startDate)}
              </p>
            </div>
            
            <div className="border-t border-b py-4">
              <p className="whitespace-pre-line">{event.description}</p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Date & Time</h3>
                  <p className="text-gray-600">
                    {formatEventDate(event.startDate)}
                    <br />
                    {formatEventTime(event.startDate)} - {formatEventTime(event.endDate)}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p className="text-gray-600">{event.location}</p>
                </div>
              </div>
              
              {event.eventUrl && (
                <div className="mt-4">
                  <h3 className="font-semibold">Event Website</h3>
                  <a href={event.eventUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {event.eventUrl}
                  </a>
                </div>
              )}
            </div>
            
            <EventRsvpForm 
              eventId={event.id} 
              isTicketed={event.isTicketed} 
              ticketTypes={event.ticketTypes}
              token={activeToken}
              guestInfo={guestInfo}
              hasGroupOrdering={tokenData?.type === 'both'}
            />
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Powered by <span className="font-medium">Event Management Platform</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventRsvpPage;
