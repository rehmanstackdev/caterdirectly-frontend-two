import { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';
import Dashboard from '@/components/dashboard/Dashboard';
import { GlassCard, GlassButton, GlassBadge } from '@/components/glass-ui';
import { CalendarEventCard } from '@/components/admin/calendar/CalendarEventCard';
import { CreateEventDialog } from '@/components/admin/calendar/CreateEventDialog';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useUpcomingEvents } from '@/hooks/calendar/useUpcomingEvents';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function CalendarManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();

  const { events, loading, error, createEvent, deleteEvent } = useCalendarEvents();
  const { events: upcomingEvents, loading: upcomingLoading } = useUpcomingEvents(7);

  const handleCreateEvent = async (data: any) => {
    try {
      await createEvent(data);
      toast({
        title: 'Event Created',
        description: 'Calendar event has been created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await deleteEvent(id);
      toast({
        title: 'Event Deleted',
        description: 'Calendar event has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.event_type === filterType);

  if (error) {
    return (
      <Dashboard userRole="admin" activeTab="calendar">
        <div className="p-6">
          <GlassCard className="p-8 text-center">
            <p className="text-destructive">Error loading calendar events: {error}</p>
          </GlassCard>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard userRole="admin" activeTab="calendar">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Calendar Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage events, orders, and important dates
            </p>
          </div>
          <GlassButton onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </GlassButton>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming (7 days)</p>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filtered</p>
                <p className="text-2xl font-bold">{filteredEvents.length}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filter */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="order">Orders</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {filterType !== 'all' && (
              <GlassBadge variant="info">
                {filteredEvents.length} {filterType} events
              </GlassBadge>
            )}
          </div>
        </GlassCard>

        {/* Events Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white/50 backdrop-blur-md border border-white/50">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <GlassCard className="p-8 text-center">
                <p className="text-muted-foreground">Loading events...</p>
              </GlassCard>
            ) : filteredEvents.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No events found</p>
                <GlassButton onClick={() => setIsCreateDialogOpen(true)}>
                  Create First Event
                </GlassButton>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((event) => (
                  <CalendarEventCard
                    key={event.id}
                    event={event}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingLoading ? (
              <GlassCard className="p-8 text-center">
                <p className="text-muted-foreground">Loading upcoming events...</p>
              </GlassCard>
            ) : upcomingEvents.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No upcoming events in the next 7 days</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <CalendarEventCard
                    key={event.id}
                    event={event}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateEvent}
      />
    </Dashboard>
  );
}

export default CalendarManagement;
