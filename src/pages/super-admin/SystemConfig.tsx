
import React, { useState } from "react";
import { ServerCog, Settings, Bell, Mail, Globe, Database, Link, Shield, ToggleLeft, CheckCircle, Save, MessageSquare } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

function SystemConfig() {
  // General Settings
  const [siteName, setSiteName] = useState("EventCater Pro");
  const [siteUrl, setSiteUrl] = useState("https://eventcaterpro.com");
  const [timezone, setTimezone] = useState("America/New_York");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Email Settings
  const [smtpHost, setSmtpHost] = useState("smtp.sendgrid.net");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("apikey");
  const [smtpPass, setSmtpPass] = useState("••••••••••••••••");
  const [senderEmail, setSenderEmail] = useState("no-reply@eventcaterpro.com");
  const [senderName, setSenderName] = useState("EventCater Pro");
  
  // Notification Templates
  const [selectedTemplate, setSelectedTemplate] = useState("new_account");
  
  // Integration Settings
  const [stripeMode, setStripeMode] = useState("live");
  const [stripeKey, setStripeKey] = useState("••••••••••••••••");
  const [stripeSecret, setStripeSecret] = useState("••••••••••••••••");
  
  const [googleMapsKey, setGoogleMapsKey] = useState("••••••••••••••••");
  const [twilioSid, setTwilioSid] = useState("••••••••••••••••");
  const [twilioToken, setTwilioToken] = useState("••••••••••••••••");
  
  // Handle form submissions
  const handleSaveGeneral = () => {
    // In a real app, this would save to backend
    alert("General settings saved!");
  };
  
  const handleSaveEmail = () => {
    // In a real app, this would save to backend
    alert("Email settings saved!");
  };
  
  const handleSaveTemplate = () => {
    // In a real app, this would save to backend
    alert("Template saved!");
  };
  
  const handleSaveIntegrations = () => {
    // In a real app, this would save to backend
    alert("Integration settings saved!");
  };

  return (
    <Dashboard userRole="super-admin" activeTab="system">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">System Configuration</h1>
          
          <div className="flex flex-wrap items-center gap-2">
            {maintenanceMode && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
                Maintenance Mode Active
              </Badge>
            )}
            
            <Button variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              System Status
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto -mx-2 px-2">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="w-full sm:w-auto flex overflow-x-auto pb-1 no-scrollbar">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="cache">Cache & Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">General Settings</CardTitle>
                  <CardDescription>Configure basic system settings for your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input 
                        id="siteName" 
                        value={siteName} 
                        onChange={(e) => setSiteName(e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="siteUrl">Site URL</Label>
                      <Input 
                        id="siteUrl" 
                        value={siteUrl} 
                        onChange={(e) => setSiteUrl(e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Default Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">Default Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="maintenance" className="text-base">Maintenance Mode</Label>
                        <p className="text-sm text-gray-500">
                          When enabled, the site will be unavailable to normal users
                        </p>
                      </div>
                      <Switch 
                        id="maintenance" 
                        checked={maintenanceMode} 
                        onCheckedChange={setMaintenanceMode} 
                      />
                    </div>
                    
                    {maintenanceMode && (
                      <div className="space-y-2">
                        <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                        <Textarea 
                          id="maintenanceMessage" 
                          placeholder="We're currently performing maintenance. Please check back soon." 
                          className="min-h-[100px]" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveGeneral} className="w-full sm:w-auto">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Email Configuration</CardTitle>
                  <CardDescription>Configure email settings for your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input 
                        id="smtpHost" 
                        value={smtpHost} 
                        onChange={(e) => setSmtpHost(e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input 
                        id="smtpPort" 
                        value={smtpPort} 
                        onChange={(e) => setSmtpPort(e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input 
                        id="smtpUser" 
                        value={smtpUser} 
                        onChange={(e) => setSmtpUser(e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="smtpPass">SMTP Password</Label>
                      <Input 
                        id="smtpPass" 
                        type="password"
                        value={smtpPass} 
                        onChange={(e) => setSmtpPass(e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="senderEmail">Sender Email</Label>
                      <Input 
                        id="senderEmail" 
                        value={senderEmail} 
                        onChange={(e) => setSenderEmail(e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="senderName">Sender Name</Label>
                      <Input 
                        id="senderName" 
                        value={senderName} 
                        onChange={(e) => setSenderName(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Tracking</Label>
                        <p className="text-sm text-gray-500">
                          Track email opens and clicks
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label className="text-base">Queue Emails</Label>
                        <p className="text-sm text-gray-500">
                          Use queue system for sending emails
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Send Test Email
                    </Button>
                    
                    <Button onClick={handleSaveEmail} className="w-full sm:w-auto">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Notification Templates</CardTitle>
                  <CardDescription>Customize email and notification templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 space-y-4">
                      <div className="space-y-2">
                        <Label>Select Template</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new_account">New Account</SelectItem>
                            <SelectItem value="password_reset">Password Reset</SelectItem>
                            <SelectItem value="booking_confirmation">Booking Confirmation</SelectItem>
                            <SelectItem value="payment_received">Payment Received</SelectItem>
                            <SelectItem value="vendor_payout">Vendor Payout</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Template Type</p>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Email</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Variables Available</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="mr-1">{'{{user_name}}'}</Badge>
                          <Badge variant="outline" className="mr-1">{'{{site_name}}'}</Badge>
                          <Badge variant="outline" className="mr-1">{'{{login_url}}'}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-3 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="templateSubject">Email Subject</Label>
                        <Input 
                          id="templateSubject" 
                          defaultValue="Welcome to EventCater Pro! Confirm your account" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="templateContent">Email Content</Label>
                        <Textarea 
                          id="templateContent" 
                          className="min-h-[200px] sm:min-h-[300px] font-mono text-sm" 
                          defaultValue={`<h1>Welcome to {{site_name}}!</h1>
<p>Hello {{user_name}},</p>
<p>Thank you for creating an account with us. To get started, please confirm your email address by clicking the button below:</p>
<p><a href="{{login_url}}" style="background-color:#F07712;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;">Confirm Email</a></p>
<p>If you didn't create this account, you can safely ignore this email.</p>
<p>Best regards,<br>The {{site_name}} Team</p>`} 
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-end gap-4">
                        <Button variant="outline" className="w-full sm:w-auto">
                          Preview
                        </Button>
                        
                        <Button onClick={handleSaveTemplate} className="w-full sm:w-auto">
                          <Save className="mr-2 h-4 w-4" />
                          Save Template
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Payment Integrations</CardTitle>
                  <CardDescription>Configure payment gateways and processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <Label className="text-base">Stripe</Label>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stripeMode">Environment</Label>
                        <Select value={stripeMode} onValueChange={setStripeMode}>
                          <SelectTrigger id="stripeMode">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="test">Test Mode</SelectItem>
                            <SelectItem value="live">Live Mode</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div></div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="stripeKey">API Key</Label>
                        <Input 
                          id="stripeKey" 
                          type="password"
                          value={stripeKey} 
                          onChange={(e) => setStripeKey(e.target.value)} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="stripeSecret">API Secret</Label>
                        <Input 
                          id="stripeSecret" 
                          type="password"
                          value={stripeSecret} 
                          onChange={(e) => setStripeSecret(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <Label className="text-base">PayPal</Label>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Other Integrations</CardTitle>
                  <CardDescription>Configure external service integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <Label className="text-base">Google Maps API</Label>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="googleMapsKey">API Key</Label>
                      <Input 
                        id="googleMapsKey" 
                        type="password"
                        value={googleMapsKey} 
                        onChange={(e) => setGoogleMapsKey(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <Label className="text-base">Twilio (SMS Notifications)</Label>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="twilioSid">Account SID</Label>
                        <Input 
                          id="twilioSid" 
                          type="password"
                          value={twilioSid} 
                          onChange={(e) => setTwilioSid(e.target.value)} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="twilioToken">Auth Token</Label>
                        <Input 
                          id="twilioToken" 
                          type="password"
                          value={twilioToken} 
                          onChange={(e) => setTwilioToken(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveIntegrations} className="w-full sm:w-auto">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="database">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Database Settings</CardTitle>
                  <CardDescription>Configure database connections and backup settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center px-4">
                      <Database className="h-16 w-16 mx-auto text-gray-300" />
                      <h2 className="mt-4 text-xl">Database Configuration</h2>
                      <p className="mt-2 text-gray-500 max-w-md">
                        This module will provide tools to manage database connections, configure backups, and optimize database performance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="cache">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Cache & Performance</CardTitle>
                  <CardDescription>Configure caching and performance optimizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-center px-4">
                      <ServerCog className="h-16 w-16 mx-auto text-gray-300" />
                      <h2 className="mt-4 text-xl">Cache Configuration</h2>
                      <p className="mt-2 text-gray-500 max-w-md">
                        This module will provide tools to manage caching settings, CDN configuration, and performance optimizations.
                      </p>
                      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                        <Button variant="outline" className="w-full sm:w-auto">
                          Clear All Cache
                        </Button>
                        <Button variant="default" className="w-full sm:w-auto">
                          Cache Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Dashboard>
  );
};

export default SystemConfig;
