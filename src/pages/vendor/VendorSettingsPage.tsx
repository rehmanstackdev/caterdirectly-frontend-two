
import Dashboard from '@/components/dashboard/Dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';

function VendorSettingsPage() {
  const notificationForm = useForm({
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      inAppNotifications: true,
      marketingEmails: false,
    }
  });
  
  return (
    <Dashboard userRole="vendor" activeTab="settings">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your profile information visible to customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Name</label>
                    <Input placeholder="Your Business Name" defaultValue="Demo Restaurant" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Business Type</label>
                    <Input placeholder="Restaurant" defaultValue="Restaurant" disabled />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <Input type="email" placeholder="contact@example.com" defaultValue="demo@restaurant.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <Input placeholder="(123) 456-7890" defaultValue="1234567890" />
                  </div>
                </div>
                
                <Button className="bg-[#F07712] hover:bg-[#F07712]/90">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Email Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications about orders and messages via email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="smsNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>SMS Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications via text messages
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="inAppNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>In-App Notifications</FormLabel>
                          <FormDescription>
                            Show notifications within the dashboard
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="marketingEmails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Marketing Emails</FormLabel>
                          <FormDescription>
                            Receive updates about new features and promotions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button className="bg-[#F07712] hover:bg-[#F07712]/90" type="submit">
                    Save Preferences
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Manage your payout information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Bank Account Information</h3>
                  <p className="text-gray-500">Add your bank account to receive payments</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Holder Name</label>
                    <Input placeholder="Full Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Number</label>
                    <Input placeholder="Account Number" type="password" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Routing Number</label>
                    <Input placeholder="Routing Number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bank Name</label>
                    <Input placeholder="Bank Name" />
                  </div>
                </div>
                
                <Button className="bg-[#F07712] hover:bg-[#F07712]/90">Save Payment Information</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
                
                <Button className="bg-[#F07712] hover:bg-[#F07712]/90">Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Dashboard>
  );
};

export default VendorSettingsPage;
