
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InvitedGuestsList from '@/components/group-order/InvitedGuestsList';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from "@/integrations/supabase/client";
import { Loader } from 'lucide-react';

interface EventInviteFormProps {
  eventId: string;
  onInviteGuests: (emails: string[]) => void;
  hasGroupOrdering?: boolean;
}

const EventInviteForm = ({
  eventId,
  onInviteGuests,
  hasGroupOrdering = false
}: EventInviteFormProps) => {
  const { toast } = useToast();
  const [invitedGuests, setInvitedGuests] = useState<{ email: string }[]>([]);
  const [bulkEmails, setBulkEmails] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [includeFood, setIncludeFood] = useState(hasGroupOrdering);
  const [isSending, setIsSending] = useState(false);
  
  const handleAddGuest = (email: string) => {
    if (email && !invitedGuests.some(g => g.email === email)) {
      setInvitedGuests([...invitedGuests, { email }]);
    }
  };
  
  const handleRemoveGuest = (email: string) => {
    setInvitedGuests(invitedGuests.filter(g => g.email !== email));
  };
  
  const handleAddBulkEmails = () => {
    if (!bulkEmails.trim()) return;
    
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = bulkEmails.match(emailPattern) || [];
    
    const newGuests = emails
      .filter(email => !invitedGuests.some(g => g.email === email))
      .map(email => ({ email }));
    
    setInvitedGuests([...invitedGuests, ...newGuests]);
    setBulkEmails('');
  };
  
  const handleSendInvites = async () => {
    if (invitedGuests.length === 0) return;

    try {
      setIsSending(true);
      
      // Get current user information
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to send invitations",
          variant: "destructive",
        });
        return;
      }
      
      // Get current user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();
      
      const hostName = profileData?.first_name && profileData?.last_name 
        ? `${profileData.first_name} ${profileData.last_name}`
        : profileData?.email || user.email || 'Event Host';
      
      const hostEmail = profileData?.email || user.email;
      
      // Get event details
      const { data: eventData } = await supabase
        .from('events')
        .select('title, start_date, address_full, address_city, address_state')
        .eq('id', eventId)
        .single();
      
      // Format guests data
      const guests = invitedGuests.map(g => ({
        name: "", // We don't have names at this point
        email: g.email,
      }));
      
      // Call our edge function for sending invitations
      const { data, error } = await supabase.functions.invoke('send-invitations', {
        body: {
          eventId,
          hostName,
          hostEmail,
          guests,
          title: eventData?.title || 'Event Invitation',
          message: customMessage,
          type: includeFood ? 'both' : 'event',
          date: eventData?.start_date,
          location: eventData?.address_full || `${eventData?.address_city}, ${eventData?.address_state}`
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to send invitations');
      }
      
      console.log('Invitations sent:', data);
      
      // Call the parent component's callback
      onInviteGuests(invitedGuests.map(g => g.email));
      
      // Reset the form
      setInvitedGuests([]);
      setCustomMessage('');
      
      toast({
        title: "Invitations Sent",
        description: `${invitedGuests.length} invitations have been sent successfully.`,
      });
      
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast({
        title: "Failed to Send Invitations",
        description: "There was an error sending the invitations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Add Guests</h3>
        <p className="text-gray-500">
          Invite guests to your event. They will receive an email with a link to RSVP.
        </p>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <InvitedGuestsList
              invitedGuests={invitedGuests}
              onRemoveGuest={handleRemoveGuest}
              onAddGuest={handleAddGuest}
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulkEmails">Bulk Add Emails</Label>
              <Textarea
                id="bulkEmails"
                placeholder="Enter multiple email addresses (separated by commas, spaces, or new lines)"
                className="min-h-[120px]"
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
              />
              <Button
                variant="outline"
                className="mt-2"
                onClick={handleAddBulkEmails}
              >
                Add Emails
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 space-y-2">
              <Label>Customize Invitation</Label>
              <Textarea
                placeholder="Add a personal message to your invitation..."
                className="min-h-[100px]"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
              
              {hasGroupOrdering && (
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox 
                    id="includeFood" 
                    checked={includeFood}
                    onCheckedChange={(checked) => setIncludeFood(!!checked)} 
                  />
                  <Label htmlFor="includeFood" className="text-sm font-normal">
                    Include food selection with RSVP
                  </Label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleSendInvites}
          disabled={invitedGuests.length === 0 || isSending}
        >
          {isSending ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            `Send Invitations (${invitedGuests.length})`
          )}
        </Button>
      </div>
    </div>
  );
};

export default EventInviteForm;
