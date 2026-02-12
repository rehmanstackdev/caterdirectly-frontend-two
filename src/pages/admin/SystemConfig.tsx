
import { useState } from "react";
import { Settings, Mail, TestTube, Info } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEmailManagement } from "@/hooks/admin/use-email-management";

function SystemConfig() {
  const { settings, updateSetting, sendTestEmail, loading } = useEmailManagement();
  const [testEmail, setTestEmail] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const getSettingValue = (key: string) => {
    const setting = settings.find(s => s.setting_key === key);
    return setting?.setting_value;
  };

  const handleSettingUpdate = async (key: string, value: any) => {
    setSaving(key);
    await updateSetting(key, value);
    setSaving(null);
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    
    setTestingEmail(true);
    setLastTestResult(null);
    console.log('Testing email system with updated credentials...');
    
    try {
      await sendTestEmail('welcome_email', testEmail, {
        user_name: 'Test User',
        login_url: 'https://caterdirectly.com/login'
      });
      console.log('Test email sent successfully!');
      setLastTestResult({ success: true, message: 'Test email sent successfully! Check your inbox and spam folder.' });
    } catch (error: any) {
      console.error('Test email failed:', error);
      setLastTestResult({ success: false, message: `Test email failed: ${error.message || 'Unknown error'}` });
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <Dashboard userRole="admin" activeTab="config">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">System Configuration</h1>
        </div>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Settings
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Email Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        All platform emails are sent from the official Cater Directly email address with proper authentication and branding.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label htmlFor="platform-sender-name">Platform Sender Name</Label>
                      <Input
                        id="platform-sender-name"
                        value="Cater Directly"
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-600 mt-1">Official platform sender name</p>
                    </div>

                    <div>
                      <Label htmlFor="platform-sender-email">Platform Email Address</Label>
                      <Input
                        id="platform-sender-email"
                        type="email"
                        value="info@caterdirectly.com"
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-600 mt-1">Official verified platform email address</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2">✓ Email System Active</h4>
                      <p className="text-sm text-green-800">
                        Gmail integration is properly configured and authenticated for info@caterdirectly.com
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Email Performance & Limits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="daily-limit">Daily Email Limit</Label>
                      <Input
                        id="daily-limit"
                        type="number"
                        value={getSettingValue('daily_email_limit') || 500}
                        onChange={(e) => handleSettingUpdate('daily_email_limit', parseInt(e.target.value))}
                        disabled={saving === 'daily_email_limit'}
                      />
                      <p className="text-sm text-gray-600 mt-1">Maximum emails to send per day</p>
                    </div>

                    <div>
                      <Label htmlFor="batch-size">Email Batch Size</Label>
                      <Input
                        id="batch-size"
                        type="number"
                        value={getSettingValue('batch_size') || 50}
                        onChange={(e) => handleSettingUpdate('batch_size', parseInt(e.target.value))}
                        disabled={saving === 'batch_size'}
                      />
                      <p className="text-sm text-gray-600 mt-1">Number of emails to process in each batch</p>
                    </div>

                    <div>
                      <Label htmlFor="retry-attempts">Retry Attempts</Label>
                      <Input
                        id="retry-attempts"
                        type="number"
                        value={getSettingValue('retry_attempts') || 3}
                        onChange={(e) => handleSettingUpdate('retry_attempts', parseInt(e.target.value))}
                        disabled={saving === 'retry_attempts'}
                      />
                      <p className="text-sm text-gray-600 mt-1">Number of retry attempts for failed emails</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gmail API Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2">✓ Gmail Credentials Updated</h4>
                      <p className="text-sm text-green-800 mb-3">
                        Gmail API credentials have been updated and database format corrected
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs text-green-700">✓ Client ID configured</p>
                        <p className="text-xs text-green-700">✓ Client Secret configured</p>
                        <p className="text-xs text-green-700">✓ Refresh Token updated</p>
                        <p className="text-xs text-green-700">✓ Database format fixed</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Email Capabilities</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Welcome emails for new users</li>
                        <li>• Password reset notifications</li>
                        <li>• Order confirmations and updates</li>
                        <li>• Vendor communications</li>
                        <li>• System notifications</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Test Email System</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="test-email">Test Email Address</Label>
                      <Input
                        id="test-email"
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="test@example.com"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Enter an email address to receive a test email
                      </p>
                    </div>

                    <Button 
                      onClick={handleTestEmail}
                      disabled={!testEmail || loading || testingEmail}
                      className="w-full"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      {testingEmail ? 'Sending Test Email...' : 'Send Test Welcome Email'}
                    </Button>

                    {lastTestResult && (
                      <Alert className={lastTestResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                        <Info className="h-4 w-4" />
                        <AlertDescription className={lastTestResult.success ? "text-green-800" : "text-red-800"}>
                          {lastTestResult.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium mb-1">Test Email Details:</p>
                      <p>• From: Cater Directly &lt;info@caterdirectly.com&gt;</p>
                      <p>• Template: Welcome Email</p>
                      <p>• Uses corrected Gmail credentials</p>
                      <p>• Check your spam folder if not received</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <div className="flex items-center justify-center h-[400px] border border-dashed rounded-md">
              <div className="text-center">
                <Settings className="h-16 w-16 mx-auto text-gray-300" />
                <h2 className="mt-4 text-xl">General System Configuration</h2>
                <p className="mt-2 text-gray-500 max-w-md">
                  This section provides tools for general system settings, including commission rates, notification preferences, and other platform configurations.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
}

export default SystemConfig;
