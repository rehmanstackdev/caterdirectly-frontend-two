
import { useState } from 'react';
import { EventGuest } from '@/types/order';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, MoreVertical, Download, UserPlus, Search } from 'lucide-react';
import { useEvents } from '@/hooks/events/use-events';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface EventGuestListProps {
  eventId: string;
  guests: EventGuest[];
  onSendReminders?: () => void;
}

const EventGuestList = ({ 
  eventId, 
  guests,
  onSendReminders
}: EventGuestListProps) => {
  const { updateGuestRsvp } = useEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  
  const filteredGuests = searchQuery
    ? guests.filter(guest => 
        guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guest.company || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : guests;
  
  const exportGuestList = () => {
    try {
      const csvContent = [
        ['Name', 'Email', 'Phone', 'RSVP Status', 'Company', 'Job Title'].join(','),
        ...guests.map(guest => [
          `"${guest.name}"`,
          `"${guest.email}"`,
          `"${guest.phone || ''}"`,
          `"${guest.rsvpStatus}"`,
          `"${guest.company || ''}"`,
          `"${guest.jobTitle || ''}"`,
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `guest-list-${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Guest list has been exported as CSV.");
    } catch (error) {
      toast.error("Something went wrong while exporting the guest list.");
    }
  };
  
  const handleSendReminders = () => {
    if (onSendReminders) {
      onSendReminders();
    } else {
      toast.success("Reminders have been sent to selected guests.");
    }
  };

  const handleUpdateRsvp = async (guestId: string, rsvpStatus: 'pending' | 'confirmed' | 'declined') => {
    try {
      await updateGuestRsvp(eventId, guestId, rsvpStatus);
      toast.success("RSVP status updated successfully");
    } catch (error) {
      console.error("Error updating RSVP status:", error);
      toast.error("Failed to update RSVP status");
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGuests(filteredGuests.map(guest => guest.id));
    } else {
      setSelectedGuests([]);
    }
  };
  
  const handleSelectGuest = (guestId: string, checked: boolean) => {
    if (checked) {
      setSelectedGuests(prev => [...prev, guestId]);
    } else {
      setSelectedGuests(prev => prev.filter(id => id !== guestId));
    }
  };
  
  const getRsvpStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'declined':
        return <Badge className="bg-red-500">Declined</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search guests..."
            className="pl-10 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportGuestList}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button 
            onClick={handleSendReminders}
            disabled={selectedGuests.length === 0 && filteredGuests.filter(g => g.rsvpStatus === 'pending').length === 0}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Reminders
          </Button>
        </div>
      </div>
      
      {filteredGuests.length === 0 ? (
        searchQuery ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No guests found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No guests have been added yet.</p>
            <Button className="mt-4" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Guests
            </Button>
          </div>
        )
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={selectedGuests.length === filteredGuests.length && filteredGuests.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>RSVP Status</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedGuests.includes(guest.id)}
                      onCheckedChange={(checked) => handleSelectGuest(guest.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>{getRsvpStatusBadge(guest.rsvpStatus)}</TableCell>
                  <TableCell>{guest.company || '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendReminders()}>
                          Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update RSVP</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleUpdateRsvp(guest.id, 'confirmed')}>
                          Mark as Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRsvp(guest.id, 'declined')}>
                          Mark as Declined
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateRsvp(guest.id, 'pending')}>
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Remove Guest
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EventGuestList;
