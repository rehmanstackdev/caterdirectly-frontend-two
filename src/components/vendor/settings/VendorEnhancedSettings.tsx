import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  DollarSign, 
  MapPin, 
  Bell, 
  Shield, 
  CreditCard, 
  TrendingUp,
  Lock,
  Save,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CommissionBoostPanel from '../CommissionBoostPanel';

interface VendorSettings {
  id: string;
  company_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  commission_rate: number;
  boost_commission_rate: number;
  delivery_radius_miles: number;
  delivery_fee_base: number;
  delivery_fee_per_mile: number;
  minimum_order_amount: number;
  lead_time_hours: number;
  auto_accept_orders: boolean;
  max_orders_per_day: number;
  notifications_email: boolean;
  notifications_sms: boolean;
  profile_visibility: 'public' | 'platform' | 'private';
  business_hours: Record<string, { open: string; close: string; enabled: boolean }>;
}

interface PayoutSettings {
  bank_account_holder: string;
  bank_account_number: string;
  bank_routing_number: string;
  bank_name: string;
  payout_schedule: 'weekly' | 'biweekly' | 'monthly';
  minimum_payout: number;
}

const VendorEnhancedSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<VendorSettings | null>(null);
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchVendorSettings();
  }, [user]);

  const fetchVendorSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (vendorError) throw vendorError;

      const vendorSettings: VendorSettings = {
        id: vendorData.id,
        company_name: vendorData.company_name,
        email: vendorData.email,
        phone: vendorData.phone,
        address: vendorData.address,
        city: vendorData.city,
        state: vendorData.state,
        zip_code: vendorData.zip_code,
        commission_rate: vendorData.commission_rate || 15,
        boost_commission_rate: vendorData.boost_commission_rate || 0,
        delivery_radius_miles: vendorData.service_radius || 25,
        delivery_fee_base: 10,
        delivery_fee_per_mile: 2,
        minimum_order_amount: vendorData.minimum_order_amount || 100,
        lead_time_hours: vendorData.lead_time_hours || 24,
        auto_accept_orders: vendorData.auto_accept_orders || false,
        max_orders_per_day: vendorData.max_orders_per_day || 0,
        notifications_email: true,
        notifications_sms: false,
        profile_visibility: 'public',
        business_hours: {
          monday: { open: '09:00', close: '17:00', enabled: true },
          tuesday: { open: '09:00', close: '17:00', enabled: true },
          wednesday: { open: '09:00', close: '17:00', enabled: true },
          thursday: { open: '09:00', close: '17:00', enabled: true },
          friday: { open: '09:00', close: '17:00', enabled: true },
          saturday: { open: '10:00', close: '16:00', enabled: true },
          sunday: { open: '10:00', close: '16:00', enabled: false },
        }
      };

      setSettings(vendorSettings);

      // Mock payout settings
      setPayoutSettings({
        bank_account_holder: '',
        bank_account_number: '',
        bank_routing_number: '',
        bank_name: '',
        payout_schedule: 'weekly',
        minimum_payout: 100
      });

    } catch (error) {
      console.error('Error fetching vendor settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings || !user) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('vendors')
        .update({
          company_name: settings.company_name,
          phone: settings.phone,
          address: settings.address,
          city: settings.city,
          state: settings.state,
          zip_code: settings.zip_code,
          service_radius: settings.delivery_radius_miles,
          minimum_order_amount: settings.minimum_order_amount,
          lead_time_hours: settings.lead_time_hours,
          auto_accept_orders: settings.auto_accept_orders,
          max_orders_per_day: settings.max_orders_per_day
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your vendor settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please ensure passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F07712] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Vendor Settings</h2>
          <p className="text-gray-600">Manage your account and business preferences</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="bg-[#F07712] hover:bg-[#F07712]/90">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Business Information */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={settings.company_name}
                    onChange={(e) => setSettings({...settings, company_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={settings.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.phone || ''}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="minimum_order">Minimum Order Amount ($)</Label>
                  <Input
                    id="minimum_order"
                    type="number"
                    value={settings.minimum_order_amount}
                    onChange={(e) => setSettings({...settings, minimum_order_amount: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={settings.address || ''}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={settings.city || ''}
                    onChange={(e) => setSettings({...settings, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={settings.state || ''}
                    onChange={(e) => setSettings({...settings, state: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={settings.zip_code || ''}
                    onChange={(e) => setSettings({...settings, zip_code: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lead_time">Lead Time (hours)</Label>
                  <Input
                    id="lead_time"
                    type="number"
                    value={settings.lead_time_hours}
                    onChange={(e) => setSettings({...settings, lead_time_hours: Number(e.target.value)})}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="auto_accept"
                    checked={settings.auto_accept_orders}
                    onCheckedChange={(checked) => setSettings({...settings, auto_accept_orders: checked})}
                  />
                  <Label htmlFor="auto_accept">Auto-accept orders</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_orders_per_day">Max Orders Per Day</Label>
                  <Input
                    id="max_orders_per_day"
                    type="number"
                    value={settings.max_orders_per_day}
                    onChange={(e) => setSettings({...settings, max_orders_per_day: Number(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Boost */}
        <TabsContent value="commission" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#F07712]" />
                  Commission Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Current Commission Rate</span>
                    <Badge variant="secondary" className="text-lg">
                      {settings.commission_rate + settings.boost_commission_rate}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Base Rate: {settings.commission_rate}% (Set by platform)</p>
                    <p>• Boost Rate: +{settings.boost_commission_rate}%</p>
                    <p>• Higher commission = Better search ranking</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CommissionBoostPanel
              vendorId={settings.id}
              currentCommissionRate={settings.commission_rate}
              currentBoostRate={settings.boost_commission_rate}
            />
          </div>
        </TabsContent>

        {/* Delivery Settings */}
        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#F07712]" />
                Delivery & Service Area
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="delivery_radius">Service Radius (miles)</Label>
                  <Input
                    id="delivery_radius"
                    type="number"
                    value={settings.delivery_radius_miles}
                    onChange={(e) => setSettings({...settings, delivery_radius_miles: Number(e.target.value)})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum distance you'll travel for service
                  </p>
                </div>
                <div>
                  <Label htmlFor="delivery_fee_base">Base Delivery Fee ($)</Label>
                  <Input
                    id="delivery_fee_base"
                    type="number"
                    value={settings.delivery_fee_base}
                    onChange={(e) => setSettings({...settings, delivery_fee_base: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="delivery_fee_mile">Fee per Mile ($)</Label>
                  <Input
                    id="delivery_fee_mile"
                    type="number"
                    value={settings.delivery_fee_per_mile}
                    onChange={(e) => setSettings({...settings, delivery_fee_per_mile: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Delivery Fee Calculation</h4>
                <p className="text-sm text-blue-800">
                  Total Fee = Base Fee (${settings.delivery_fee_base}) + (Distance × ${settings.delivery_fee_per_mile}/mile)
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Example: 10 miles = ${settings.delivery_fee_base} + (10 × ${settings.delivery_fee_per_mile}) = ${settings.delivery_fee_base + (10 * settings.delivery_fee_per_mile)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts */}
        <TabsContent value="payouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#F07712]" />
                Payout Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payoutSettings && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="account_holder">Account Holder Name</Label>
                      <Input
                        id="account_holder"
                        value={payoutSettings.bank_account_holder}
                        onChange={(e) => setPayoutSettings({...payoutSettings, bank_account_holder: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input
                        id="bank_name"
                        value={payoutSettings.bank_name}
                        onChange={(e) => setPayoutSettings({...payoutSettings, bank_name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="routing_number">Routing Number</Label>
                      <div className="relative">
                        <Input
                          id="routing_number"
                          type={showBankDetails ? "text" : "password"}
                          value={payoutSettings.bank_routing_number}
                          onChange={(e) => setPayoutSettings({...payoutSettings, bank_routing_number: e.target.value})}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowBankDetails(!showBankDetails)}
                        >
                          {showBankDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="account_number">Account Number</Label>
                      <Input
                        id="account_number"
                        type={showBankDetails ? "text" : "password"}
                        value={payoutSettings.bank_account_number}
                        onChange={(e) => setPayoutSettings({...payoutSettings, bank_account_number: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payout_schedule">Payout Schedule</Label>
                      <select
                        id="payout_schedule"
                        className="w-full p-2 border rounded-md"
                        value={payoutSettings.payout_schedule}
                        onChange={(e) => setPayoutSettings({...payoutSettings, payout_schedule: e.target.value as any})}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="minimum_payout">Minimum Payout ($)</Label>
                      <Input
                        id="minimum_payout"
                        type="number"
                        value={payoutSettings.minimum_payout}
                        onChange={(e) => setPayoutSettings({...payoutSettings, minimum_payout: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#F07712]" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications_email}
                    onCheckedChange={(checked) => setSettings({...settings, notifications_email: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.notifications_sms}
                    onCheckedChange={(checked) => setSettings({...settings, notifications_sms: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#F07712]" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button onClick={handlePasswordReset} disabled={!newPassword || newPassword !== confirmPassword}>
                    <Key className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorEnhancedSettings;
