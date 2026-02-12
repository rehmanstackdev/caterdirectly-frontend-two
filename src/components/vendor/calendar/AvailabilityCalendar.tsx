import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { addDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, CalendarPlus, CalendarX } from 'lucide-react';

// Event types
type EventStatus = 'booking' | 'unavailable';

interface CalendarEvent {
  date: Date;
  status: EventStatus;
  title?: string;
  time?: string;
}

const AvailabilityCalendar: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      date: new Date(),
      status: 'booking',
      title: 'Tech Company Lunch',
      time: '12:00 PM - 3:00 PM'
    },
    {
      date: addDays(new Date(), 2),
      status: 'unavailable',
    },
    {
      date: addDays(new Date(), 5),
      status: 'booking',
      title: 'Birthday Party',
      time: '6:00 PM - 10:00 PM'
    }
  ]);
  
  const [defaultAvailable, setDefaultAvailable] = useState(true);
  const [selectedView, setSelectedView] = useState('month');
  const [businessHours, setBusinessHours] = useState({
    monday: { start: '9:00', end: '17:00', available: true },
    tuesday: { start: '9:00', end: '17:00', available: true },
    wednesday: { start: '9:00', end: '17:00', available: true },
    thursday: { start: '9:00', end: '17:00', available: true },
    friday: { start: '9:00', end: '17:00', available: true },
    saturday: { start: '10:00', end: '15:00', available: true },
    sunday: { start: '10:00', end: '15:00', available: false },
  });
  
  const isDateUnavailable = (date: Date) => {
    return events.some(
      event => 
        event.date.toDateString() === date.toDateString() && 
        event.status === 'unavailable'
    );
  };
  
  const isDateBooked = (date: Date) => {
    return events.some(
      event => 
        event.date.toDateString() === date.toDateString() && 
        event.status === 'booking'
    );
  };
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    // Check if date is already in events
    const existingEventIndex = events.findIndex(
      event => event.date.toDateString() === selectedDate.toDateString()
    );
    
    if (existingEventIndex >= 0) {
      // Toggle between unavailable and available
      if (events[existingEventIndex].status === 'unavailable') {
        // Remove the unavailable date
        const updatedEvents = [...events];
        updatedEvents.splice(existingEventIndex, 1);
        setEvents(updatedEvents);
      } else {
        // Cannot directly toggle a booking, show a confirmation dialog in a real app
        // For demo purposes, just log this
        console.log('Cannot toggle a date with bookings');
      }
    } else {
      // Add as unavailable date
      setEvents([...events, {
        date: selectedDate,
        status: 'unavailable'
      }]);
    }
    
    setDate(selectedDate);
  };
  
  const handleToggleDefault = (checked: boolean) => {
    setDefaultAvailable(checked);
  };
  
  const handleToggleDay = (day: string, checked: boolean) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day as keyof typeof businessHours],
        available: checked
      }
    });
  };
  
  const getDateClassName = (date: Date) => {
    if (isDateUnavailable(date)) {
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    }
    if (isDateBooked(date)) {
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
    return '';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Availability Calendar</CardTitle>
        <CardDescription>Manage your availability and view bookings</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="settings">Business Hours</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  modifiersClassNames={{
                    selected: 'bg-primary text-primary-foreground',
                  }}
                  modifiers={{
                    unavailable: (date) => isDateUnavailable(date),
                    booked: (date) => isDateBooked(date),
                  }}
                  modifiersStyles={{
                    unavailable: { background: 'rgb(254, 226, 226)', color: 'rgb(153, 27, 27)' },
                    booked: { background: 'rgb(219, 234, 254)', color: 'rgb(30, 58, 138)' }
                  }}
                />
                
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                    <span className="text-sm text-gray-600">Unavailable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                    <span className="text-sm text-gray-600">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                    <span className="text-sm text-gray-600">Available</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium mb-3">Events for {date?.toLocaleDateString()}</h3>
                {events
                  .filter(event => date && event.date.toDateString() === date.toDateString())
                  .map((event, index) => (
                    <div 
                      key={index} 
                      className={`p-4 mb-2 rounded-md ${
                        event.status === 'booking' 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      {event.status === 'booking' ? (
                        <>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="font-medium">{event.title}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{event.time}</div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CalendarX className="h-4 w-4 text-red-500" />
                          <span>Marked as unavailable</span>
                        </div>
                      )}
                    </div>
                  ))}
                
                {date && !(events.some(event => 
                  event.date.toDateString() === date.toDateString()
                )) && (
                  <div className="text-center py-6 text-gray-500">
                    <p>No events for this date</p>
                    <div className="mt-2 flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (date) {
                            setEvents([...events, {
                              date: date,
                              status: 'unavailable'
                            }]);
                          }
                        }}
                      >
                        <CalendarX className="h-4 w-4 mr-1" />
                        Mark Unavailable
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="default-availability" className="font-medium">
                  Default Availability Status
                </Label>
                <div className="flex items-center gap-2">
                  <span className={!defaultAvailable ? 'text-gray-900' : 'text-gray-500'}>Unavailable</span>
                  <Switch 
                    id="default-availability" 
                    checked={defaultAvailable} 
                    onCheckedChange={handleToggleDefault}
                  />
                  <span className={defaultAvailable ? 'text-gray-900' : 'text-gray-500'}>Available</span>
                </div>
              </div>
              
              <div className="border rounded-md p-4 space-y-4">
                <h3 className="font-medium">Business Hours</h3>
                
                {Object.entries(businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between">
                    <div className="w-28">
                      <span className="font-medium capitalize">{day}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select defaultValue={hours.start}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <SelectItem key={i} value={`${i}:00`}>
                              {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <span>to</span>
                      
                      <Select defaultValue={hours.end}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <SelectItem key={i} value={`${i}:00`}>
                              {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={hours.available} 
                          onCheckedChange={(checked) => handleToggleDay(day, checked)}
                        />
                        <span className={hours.available ? 'text-green-600' : 'text-gray-500'}>
                          {hours.available ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full mt-4">
                  Save Business Hours
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bulk">
            <div className="space-y-6">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Set Holiday/Vacation Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarPlus className="mr-2 h-4 w-4" />
                          Select start date
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal mt-1"
                        >
                          <CalendarPlus className="mr-2 h-4 w-4" />
                          Select end date
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <Button className="w-full mt-4 bg-[#F07712] hover:bg-[#F07712]/90">
                  <CalendarX className="mr-2 h-4 w-4" />
                  Mark Selected Period as Unavailable
                </Button>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Set Recurring Availability</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Label>Every</Label>
                      <Select defaultValue="monday">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                          <SelectItem value="thursday">Thursday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                          <SelectItem value="saturday">Saturday</SelectItem>
                          <SelectItem value="sunday">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <Label>From</Label>
                        <Select defaultValue="9:00">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }).map((_, i) => (
                              <SelectItem key={i} value={`${i}:00`}>
                                {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>To</Label>
                        <Select defaultValue="17:00">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }).map((_, i) => (
                              <SelectItem key={i} value={`${i}:00`}>
                                {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="w-32">
                      <Label>Status</Label>
                      <Select defaultValue="available">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="unavailable">Unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-4">
                  Save Recurring Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;
