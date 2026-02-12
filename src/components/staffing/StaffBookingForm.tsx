import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel,
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Calendar, Clock, Users, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';

// Staff categories
const staffCategories = [
  {
    type: 'bartender',
    name: 'Bartender',
    rates: [
      { level: 'Standard', rate: 55 },
      { level: 'Premium', rate: 75 },
      { level: 'Master Mixologist', rate: 95 }
    ],
    preferences: [
      { id: 'cocktails', name: 'Cocktail Specialist' },
      { id: 'beer', name: 'Craft Beer Knowledge' },
      { id: 'wine', name: 'Wine Expert' },
      { id: 'flair', name: 'Flair Bartending' }
    ]
  },
  {
    type: 'server',
    name: 'Server',
    rates: [
      { level: 'Standard', rate: 40 },
      { level: 'Premium', rate: 55 }
    ],
    preferences: [
      { id: 'fine-dining', name: 'Fine Dining Experience' },
      { id: 'buffet', name: 'Buffet Service' },
      { id: 'multilingual', name: 'Multilingual' }
    ]
  },
  {
    type: 'dj',
    name: 'DJ',
    rates: [
      { level: 'Standard', rate: 200 },
      { level: 'Premium', rate: 300 },
      { level: 'Celebrity', rate: 500 }
    ],
    preferences: [
      { id: 'wedding', name: 'Wedding Specialist' },
      { id: 'corporate', name: 'Corporate Events' },
      { id: 'edm', name: 'EDM/Club' },
      { id: 'hiphop', name: 'Hip Hop' },
      { id: '80s', name: '80s & Retro' }
    ]
  },
  {
    type: 'security',
    name: 'Security',
    rates: [
      { level: 'Standard', rate: 45 },
      { level: 'Premium', rate: 65 }
    ],
    preferences: [
      { id: 'event', name: 'Event Security' },
      { id: 'vip', name: 'VIP Protection' },
      { id: 'crowd', name: 'Crowd Management' }
    ]
  }
];

const StaffBookingForm = () => {
  const [staffType, setStaffType] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [eventDetails, setEventDetails] = useState({
    startTime: '',
    endTime: '',
    numberOfStaff: 1,
    preferences: '',
    specialRequirements: '',
  });
  
  const selectedStaff = staffCategories.find(staff => staff.type === staffType);
  const selectedRate = selectedStaff?.rates.find(rate => rate.level === selectedLevel);
  const hourlyRate = selectedRate?.rate || 0;
  const totalHours = eventDetails.startTime && eventDetails.endTime 
    ? calculateHours(eventDetails.startTime, eventDetails.endTime) 
    : 0;
  const totalCost = hourlyRate * totalHours * eventDetails.numberOfStaff;
  
  function calculateHours(start: string, end: string): number {
    // Simple hour calculation for demo
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    return endHour > startHour ? endHour - startHour : 24 - startHour + endHour;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submission:', {
      staffType,
      selectedLevel,
      selectedDate,
      eventDetails,
      totalCost
    });
    // In a real app, we would submit this to the backend
  };
  
  const handleInputChange = (field: keyof typeof eventDetails, value: string | number) => {
    setEventDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Book Staff Services</CardTitle>
        <CardDescription>
          Hire qualified staff for your event with standardized rates and vetted professionals
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="staff-type">Staff Type</Label>
              <Select 
                value={staffType} 
                onValueChange={(value) => {
                  setStaffType(value);
                  setSelectedLevel('');
                }}
              >
                <SelectTrigger id="staff-type" className="w-full">
                  <SelectValue placeholder="Select staff type" />
                </SelectTrigger>
                <SelectContent>
                  {staffCategories.map(staff => (
                    <SelectItem key={staff.type} value={staff.type}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {staffType && (
              <div>
                <Label htmlFor="staff-level">Experience Level</Label>
                <Select 
                  value={selectedLevel} 
                  onValueChange={(value) => setSelectedLevel(value)}
                >
                  <SelectTrigger id="staff-level" className="w-full">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedStaff?.rates.map(rate => (
                      <SelectItem key={rate.level} value={rate.level}>
                        {rate.level} (${rate.rate}/hr)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-date">Event Date</Label>
                <div className="mt-1">
                  <DatePicker 
                    date={selectedDate} 
                    onSelect={setSelectedDate} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Select
                    value={eventDetails.startTime}
                    onValueChange={(value) => handleInputChange('startTime', value)}
                  >
                    <SelectTrigger id="start-time" className="w-full">
                      <SelectValue placeholder="Start" />
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
                  <Label htmlFor="end-time">End Time</Label>
                  <Select
                    value={eventDetails.endTime}
                    onValueChange={(value) => handleInputChange('endTime', value)}
                  >
                    <SelectTrigger id="end-time" className="w-full">
                      <SelectValue placeholder="End" />
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
            </div>
            
            <div>
              <Label htmlFor="number-of-staff">Number of Staff Needed</Label>
              <div className="flex items-center mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (eventDetails.numberOfStaff > 1) {
                      handleInputChange('numberOfStaff', eventDetails.numberOfStaff - 1);
                    }
                  }}
                >
                  -
                </Button>
                <div className="w-12 mx-2 text-center">
                  {eventDetails.numberOfStaff}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleInputChange('numberOfStaff', eventDetails.numberOfStaff + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            
            {staffType && selectedStaff?.preferences && (
              <div>
                <Label htmlFor="preferences">Preferences</Label>
                <Select
                  value={eventDetails.preferences}
                  onValueChange={(value) => handleInputChange('preferences', value)}
                >
                  <SelectTrigger id="preferences" className="w-full">
                    <SelectValue placeholder={`Select ${selectedStaff.name} preferences`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Specializations</SelectLabel>
                      {selectedStaff.preferences.map(pref => (
                        <SelectItem key={pref.id} value={pref.id}>
                          {pref.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="special-requirements">Special Requirements</Label>
              <Textarea
                id="special-requirements"
                placeholder="Any specific details or requirements for your event staff"
                className="mt-1"
                value={eventDetails.specialRequirements}
                onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <h3 className="font-medium">Booking Summary</h3>
            
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-gray-600">Staff Type:</span>
              <span>{selectedStaff?.name || 'Not selected'}</span>
              
              <span className="text-gray-600">Experience Level:</span>
              <span>{selectedLevel || 'Not selected'}</span>
              
              <span className="text-gray-600">Date:</span>
              <span>{selectedDate ? format(selectedDate, 'PPP') : 'Not selected'}</span>
              
              <span className="text-gray-600">Time:</span>
              <span>
                {eventDetails.startTime && eventDetails.endTime 
                  ? `${eventDetails.startTime} - ${eventDetails.endTime} (${totalHours} hours)` 
                  : 'Not selected'}
              </span>
              
              <span className="text-gray-600">Staff Count:</span>
              <span>{eventDetails.numberOfStaff}</span>
              
              <span className="text-gray-600">Rate:</span>
              <span>${hourlyRate}/hour per staff</span>
            </div>
            
            <div className="pt-2 mt-2 border-t flex justify-between items-center">
              <span className="font-semibold">Estimated Total:</span>
              <span className="font-bold text-xl">${totalCost.toFixed(2)}</span>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#F07712] hover:bg-[#F07712]/90"
            disabled={!staffType || !selectedLevel || !selectedDate || !eventDetails.startTime || !eventDetails.endTime}
          >
            Request Staff Booking
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            All staff are vetted professionals. You'll be matched with available staff based on your requirements.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default StaffBookingForm;
