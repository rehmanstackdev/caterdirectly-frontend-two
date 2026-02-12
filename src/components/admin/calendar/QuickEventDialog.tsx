import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GlassInput } from '@/components/glass-ui/GlassInput';
import { GlassButton } from '@/components/glass-ui/GlassButton';
import { CustomDropdown } from '@/components/glass-ui/CustomDropdown';
import { useCreateEvent } from '@/hooks/use-backend-events';
import { fetchAdminUsers, type AdminUser } from '@/utils/adminUsers';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomTimePicker } from '@/components/ui/custom-time-picker';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';

interface QuickEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
}

const eventColors = [
  { value: '#FF0000', label: 'Red' },
  { value: '#FFFF00', label: 'Yellow' },
  { value: '#800080', label: 'Purple' },
  { value: '#0000FF', label: 'Blue' },
  { value: '#008000', label: 'Green' },
  { value: '#2E8B57', label: 'Sea Green' },
];

export function QuickEventDialog({ open, onOpenChange, selectedDate }: QuickEventDialogProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventType, setEventType] = useState<'meeting' | 'reminder' | 'order' | 'deadline' | 'custom'>('custom');
  const [customEventTypeName, setCustomEventTypeName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'all' | 'private' | 'specific'>('all');
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [color, setColor] = useState('#FF0000');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const createEventMutation = useCreateEvent();

  // Clear form when dialog closes
  useEffect(() => {
    if (!open) {
      // Reset all form fields when dialog closes
      setTitle('');
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setEventType('custom');
      setCustomEventTypeName('');
      setDescription('');
      setVisibility('all');
      setSelectedAdmins([]);
      setColor('#FF0000');
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchAdminUsers().then(setAdminUsers);
      if (selectedDate) {
        setStartDate(format(selectedDate, "yyyy-MM-dd"));
        setStartTime(format(selectedDate, "HH:mm"));
      }
    }
  }, [open, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !startDate || !startTime) {
      return;
    }

    // Combine date and time into datetime-local format
    const formatDateTimeForAPI = (date: string, time: string) => {
      // Combine date (YYYY-MM-DD) and time (HH:mm) into format: "2025-12-12T18:41:00.000Z"
      return `${date}T${time}:00.000Z`;
    };

    // Determine the event type name
    const finalEventType = eventType === 'custom'
      ? (customEventTypeName.trim() || 'Custom Event')
      : eventType.charAt(0).toUpperCase() + eventType.slice(1);

    const eventData = {
      title,
      startDateTime: formatDateTimeForAPI(startDate, startTime),
      endDateTime: endDate && endTime
        ? formatDateTimeForAPI(endDate, endTime)
        : formatDateTimeForAPI(startDate, startTime),
      eventType: finalEventType,
      description,
      themeColor: color,
      visibility: visibility === 'all' ? 'all_admin' : visibility === 'private' ? 'private' : 'specific_admin'
    };

    createEventMutation.mutate(eventData, {
      onSuccess: () => {
        // Reset form
        setTitle('');
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        setEventType('custom');
        setCustomEventTypeName('');
        setDescription('');
        setVisibility('all');
        setSelectedAdmins([]);
        setColor('#FF0000');
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] bg-white border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <GlassInput
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <CustomDatePicker
                  id="startDate"
                  value={startDate}
                  onChange={setStartDate}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <CustomTimePicker
                  id="startTime"
                  value={startTime}
                  onChange={setStartTime}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <CustomDatePicker
                  id="endDate"
                  value={endDate}
                  onChange={setEndDate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <CustomTimePicker
                  id="endTime"
                  value={endTime}
                  onChange={setEndTime}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <CustomDropdown
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as any)}
              options={[
                { value: 'meeting', label: 'Meeting' },
                { value: 'reminder', label: 'Reminder' },
                { value: 'order', label: 'Order' },
                { value: 'deadline', label: 'Deadline' },
                { value: 'custom', label: 'Custom' },
              ]}
            />
          </div>

          {eventType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customEventTypeName">Custom Event Type Name</Label>
              <GlassInput
                id="customEventTypeName"
                value={customEventTypeName}
                onChange={(e) => setCustomEventTypeName(e.target.value)}
                placeholder="e.g., Workshop, Training, Conference"
              />
              <p className="text-xs text-muted-foreground">
                Give your custom event a specific name. This will be saved for future use.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description (optional)"
              className="bg-glass-white border-white/50 backdrop-blur-glass"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {eventColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Visibility</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === 'all'}
                  onChange={() => setVisibility('all')}
                  className="w-4 h-4"
                />
                <span className="text-sm">🌐 All Admins</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                  className="w-4 h-4"
                />
                <span className="text-sm">🔒 Private (Only Me)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === 'specific'}
                  onChange={() => setVisibility('specific')}
                  className="w-4 h-4"
                />
                <span className="text-sm">👥 Specific Admins</span>
              </label>
            </div>

            {visibility === 'specific' && (
              <div className="ml-6 space-y-2 max-h-40 overflow-y-auto p-2 rounded-lg bg-glass-white border border-white/30">
                {adminUsers.map((admin) => (
                  <label key={admin.user_id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedAdmins.includes(admin.user_id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAdmins([...selectedAdmins, admin.user_id]);
                        } else {
                          setSelectedAdmins(selectedAdmins.filter(id => id !== admin.user_id));
                        }
                      }}
                    />
                    <span className="text-sm">
                      {admin.first_name} {admin.last_name} ({admin.email})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <GlassButton
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton type="submit" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
            </GlassButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
