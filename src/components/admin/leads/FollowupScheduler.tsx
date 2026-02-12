import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useScheduleFollowup } from "@/hooks/admin/use-followup";
import { Calendar, Clock, Bell } from "lucide-react";

interface FollowupSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName: string;
}

export function FollowupScheduler({ isOpen, onClose, leadId, leadName }: FollowupSchedulerProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    contact_method: 'email'
  });

  const scheduleFollowup = useScheduleFollowup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.scheduled_date || !formData.scheduled_time) {
      return;
    }

    const scheduledAt = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);

    try {
      await scheduleFollowup.mutateAsync({
        leadId,
        title: formData.title,
        description: formData.description,
        contactMethod: formData.contact_method,
        scheduledAt: scheduledAt.toISOString()
      });
      
      handleClose();
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      scheduled_date: '',
      scheduled_time: '',
      contact_method: 'email'
    });
    onClose();
  };

  // Set default date to tomorrow
  React.useEffect(() => {
    if (isOpen && !formData.scheduled_date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        scheduled_date: tomorrow.toISOString().split('T')[0],
        scheduled_time: '09:00',
        title: `Follow up with ${leadName}`
      }));
    }
  }, [isOpen, leadName, formData.scheduled_date]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Schedule Follow-up
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Follow-up Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Follow up with John Doe"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="scheduled_date">Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="scheduled_time">Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="scheduled_time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="contact_method">Contact Method</Label>
            <select
              id="contact_method"
              value={formData.contact_method}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_method: e.target.value }))}
              className="w-full px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="email">Email</option>
              <option value="phone">Phone Call</option>
              <option value="meeting">In-Person Meeting</option>
              <option value="video">Video Call</option>
              <option value="text">Text Message</option>
            </select>
          </div>

          <div>
            <Label htmlFor="description">Notes (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Any specific notes for this follow-up..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={scheduleFollowup.isPending}>
              {scheduleFollowup.isPending ? 'Scheduling...' : 'Schedule Follow-up'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}