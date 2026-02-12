
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { NotificationPreferences } from "@/types/profile";
import { useProfile } from "@/hooks/use-profile";

const formSchema = z.object({
  orderUpdates: z.boolean(),
  vendorMessages: z.boolean(),
  promotions: z.boolean(),
  reminders: z.boolean(),
  newsletter: z.boolean(),
  productUpdates: z.boolean(),
  eventRecaps: z.boolean(),
  accountAlerts: z.boolean(),
});

interface NotificationsFormProps {
  initialData?: NotificationPreferences;
}

const NotificationsForm = ({ initialData }: NotificationsFormProps) => {
  const { toast } = useToast();
  const { updateProfile } = useProfile();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      orderUpdates: true,
      vendorMessages: true,
      promotions: false,
      reminders: true,
      newsletter: false,
      productUpdates: true,
      eventRecaps: true,
      accountAlerts: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateProfile('notifications', values);
      toast({ title: 'Notification preferences updated', description: 'Your notification preferences have been saved.' });
    } catch (e) {
      // toast handled in hook
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Order Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Control notifications related to your orders and bookings
                </p>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="orderUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Order Updates</FormLabel>
                        <FormDescription>
                          Receive notifications about your order status changes
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
                  name="reminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Event Reminders</FormLabel>
                        <FormDescription>
                          Get reminded about upcoming events and deadlines
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
                  name="eventRecaps"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Event Recaps</FormLabel>
                        <FormDescription>
                          Receive post-event summaries and feedback requests
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
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Communication Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Control how you communicate with vendors and our team
                </p>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="vendorMessages"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Vendor Messages</FormLabel>
                        <FormDescription>
                          Receive notifications when vendors send you messages
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
                  name="accountAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Account Alerts</FormLabel>
                        <FormDescription>
                          Get important notifications about your account
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
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Marketing & Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Control marketing communications and platform updates
                </p>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="promotions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Promotions & Offers</FormLabel>
                        <FormDescription>
                          Receive special offers, discounts, and promotional content
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
                  name="newsletter"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Newsletter</FormLabel>
                        <FormDescription>
                          Get our monthly newsletter with event trends and tips
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
                  name="productUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Product Updates</FormLabel>
                        <FormDescription>
                          Stay informed about new features and platform improvements
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
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NotificationsForm;
