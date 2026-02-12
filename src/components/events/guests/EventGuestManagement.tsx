
import { useState } from 'react';
import { Event } from '@/types/order';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventGuestList from '@/components/events/EventGuestList';
import EventInviteForm from '@/components/events/EventInviteForm';
import GuestListSettings from '@/components/events/guests/GuestListSettings';
import { useEvents } from '@/hooks/use-events';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

interface EventGuestManagementProps {
  event: Event;
}

const EventGuestManagement = ({ event }: EventGuestManagementProps) => {
  const [activeTab, setActiveTab] = useState('guest-list');
  const { addGuest, sendReminders, isAddingGuest, isSendingReminders } = useEvents();

  const handleAddGuests = async (emails: string[]) => {
    if (emails.length === 0 || isAddingGuest) return;
    
    try {
      const addedGuests = [];
      
      for (const email of emails) {
        const newGuest = await addGuest(event.id, {
          id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: email.split('@')[0], // Placeholder name based on email
          email: email,
          rsvpStatus: 'pending',
        });
        
        addedGuests.push(newGuest);
      }
      
      toast.success(`Successfully added ${emails.length} guest${emails.length > 1 ? 's' : ''} to your event.`);
      setActiveTab('guest-list');
    } catch (error) {
      toast.error("Failed to add guests. Please try again.");
      console.error("Error adding guests:", error);
    }
  };

  const handleSendReminders = async () => {
    if (isSendingReminders) return;
    
    try {
      await sendReminders(event.id);
      toast.success("Reminders have been sent to all guests with pending responses.");
    } catch (error) {
      toast.error("Failed to send reminders. Please try again.");
      console.error("Error sending reminders:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{event.title}</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="guest-list">Guest List</TabsTrigger>
          <TabsTrigger value="invite">Send Invites</TabsTrigger>
          <TabsTrigger value="settings">List Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="guest-list">
          <EventGuestList 
            eventId={event.id} 
            guests={event.guests} 
            onSendReminders={handleSendReminders}
          />
        </TabsContent>
        
        <TabsContent value="invite">
          {isAddingGuest ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-[#F07712] mb-4" />
                <p className="text-gray-500">Adding guests...</p>
              </CardContent>
            </Card>
          ) : (
            <EventInviteForm 
              eventId={event.id} 
              onInviteGuests={handleAddGuests}
              hasGroupOrdering={(event as any).hasGroupOrdering}
            />
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <GuestListSettings event={event} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventGuestManagement;
