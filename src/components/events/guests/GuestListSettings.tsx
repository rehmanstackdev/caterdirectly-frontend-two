
import React from 'react';
import { Event } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { useEvents } from '@/hooks/events/use-events';
import { toast } from 'sonner';

interface GuestListSettingsProps {
  event: Event;
}

const GuestListSettings = ({ event }: GuestListSettingsProps) => {
  const { updateEvent, isUpdatingEvent } = useEvents();
  
  // Default values from event or set sensible defaults
  const defaultValues = {
    capacity: event.capacity || 100,
    allowPlusOnes: event.allowPlusOnes || false,
    autoNotify: event.autoNotify || false,
    autoNotifyThreshold: event.autoNotifyThreshold || 80,
    customRsvpMessage: event.customRsvpMessage || '',
    allowWaitlist: event.allowWaitlist || false,
  };
  
  const form = useForm({
    defaultValues,
  });
  
  const onSubmit = async (data: any) => {
    try {
      await updateEvent(event.id, data);
      toast.success("Guest list settings updated successfully");
    } catch (error) {
      console.error("Error updating event settings:", error);
      toast.error("Failed to update guest list settings");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Capacity Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Capacity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of guests allowed
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="allowPlusOnes"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Allow Plus Ones</FormLabel>
                        <FormDescription>
                          Let guests bring additional attendees
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="allowWaitlist"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Enable Waitlist</FormLabel>
                        <FormDescription>
                          Create a waitlist when capacity is reached
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isUpdatingEvent}>Save Capacity Settings</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="autoNotify"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Auto-Notify</FormLabel>
                        <FormDescription>
                          Send "Almost Sold Out" notifications when approaching capacity
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {form.watch('autoNotify') && (
                  <FormField
                    control={form.control}
                    name="autoNotifyThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification Threshold: {field.value}%</FormLabel>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            min={50}
                            max={95}
                            step={5}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Send notifications when event reaches this percentage of capacity
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="customRsvpMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom RSVP Message</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Add a personal message to all RSVP emails
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isUpdatingEvent}>Save Notification Settings</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuestListSettings;
