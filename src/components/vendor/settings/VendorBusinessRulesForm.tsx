import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, MapPin, Calendar, AlertTriangle, Plus, X } from 'lucide-react';
import { useVendorBusinessRules } from '@/hooks/use-vendor-business-rules';
import { VendorBusinessRules, VendorSettings } from '@/types/vendor';
import { formatCurrency } from '@/lib/utils';

const VendorBusinessRulesForm: React.FC = () => {
  const { 
    rules, 
    vendorSettings, 
    loading, 
    saving, 
    saveRules, 
    saveVendorSettings,
    deleteRule 
  } = useVendorBusinessRules();

  const [newRule, setNewRule] = useState<Partial<VendorBusinessRules>>({
    service_types: [],
    minimum_order_amount: 0,
    lead_time_hours: 24,
    delivery_fee_base: 0,
    delivery_fee_per_mile: 0,
    delivery_radius_miles: 25,
    requires_approval: true
  });

  const [settings, setSettings] = useState<Partial<VendorSettings>>({});
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);

  useEffect(() => {
    if (vendorSettings) {
      setSettings(vendorSettings);
    }
  }, [vendorSettings]);

  const serviceTypeOptions = [
    'catering',
    'venue',
    'staff',
    'entertainment',
    'photography',
    'flowers',
    'transportation'
  ];

  const handleSaveRule = async () => {
    if (newRule.service_types && newRule.service_types.length > 0) {
      await saveRules(newRule as VendorBusinessRules);
      setNewRule({
        service_types: [],
        minimum_order_amount: 0,
        lead_time_hours: 24,
        delivery_fee_base: 0,
        delivery_fee_per_mile: 0,
        delivery_radius_miles: 25,
        requires_approval: true
      });
      setShowNewRuleForm(false);
    }
  };

  const handleSaveSettings = async () => {
    await saveVendorSettings(settings);
  };

  const addServiceType = (serviceType: string) => {
    if (!newRule.service_types?.includes(serviceType)) {
      setNewRule({
        ...newRule,
        service_types: [...(newRule.service_types || []), serviceType]
      });
    }
  };

  const removeServiceType = (serviceType: string) => {
    setNewRule({
      ...newRule,
      service_types: newRule.service_types?.filter(st => st !== serviceType) || []
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading business rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="availability">Availability Status</Label>
              <Select
                value={settings.availability_status}
                onValueChange={(value) => setSettings({
                  ...settings,
                  availability_status: value as 'available' | 'busy' | 'unavailable'
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-accept"
                checked={settings.auto_accept_orders}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  auto_accept_orders: checked
                })}
              />
              <Label htmlFor="auto-accept">Auto-accept high-value orders</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max-orders-per-day">Max Orders Per Day</Label>
              <Input
                id="max-orders-per-day"
                type="number"
                value={settings.max_orders_per_day || 0}
                onChange={(e) => setSettings({
                  ...settings,
                  max_orders_per_day: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div>
              <Label htmlFor="default-lead-time">Default Lead Time (hours)</Label>
              <Input
                id="default-lead-time"
                type="number"
                value={settings.lead_time_hours || 24}
                onChange={(e) => setSettings({
                  ...settings,
                  lead_time_hours: parseInt(e.target.value) || 24
                })}
              />
            </div>

            <div>
              <Label htmlFor="default-minimum">Default Minimum Order ($)</Label>
              <Input
                id="default-minimum"
                type="number"
                step="0.01"
                value={settings.minimum_order_amount || 0}
                onChange={(e) => setSettings({
                  ...settings,
                  minimum_order_amount: parseFloat(e.target.value) || 0
                })}
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save General Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Service-Specific Rules
            </span>
            <Button onClick={() => setShowNewRuleForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No service-specific rules configured</p>
              <p className="text-sm mt-2">Add rules to set different requirements for different service types</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-2">
                      {rule.service_types.map((type) => (
                        <Badge key={type} variant="secondary">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      onClick={() => rule.id && deleteRule(rule.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>Min: {formatCurrency(rule.minimum_order_amount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{rule.lead_time_hours}h lead time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{rule.delivery_radius_miles} mile radius</span>
                    </div>
                    <div>
                      <Badge variant={rule.requires_approval ? "destructive" : "default"}>
                        {rule.requires_approval ? 'Requires Approval' : 'Auto-Accept'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Rule Form */}
          {showNewRuleForm && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
              <div>
                <Label>Service Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {serviceTypeOptions.map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant={newRule.service_types?.includes(type) ? "default" : "outline"}
                      onClick={() => {
                        if (newRule.service_types?.includes(type)) {
                          removeServiceType(type);
                        } else {
                          addServiceType(type);
                        }
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="min-order">Minimum Order Amount ($)</Label>
                  <Input
                    id="min-order"
                    type="number"
                    step="0.01"
                    value={newRule.minimum_order_amount}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      minimum_order_amount: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="lead-time">Lead Time (hours)</Label>
                  <Input
                    id="lead-time"
                    type="number"
                    value={newRule.lead_time_hours}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      lead_time_hours: parseInt(e.target.value) || 24
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="delivery-radius">Delivery Radius (miles)</Label>
                  <Input
                    id="delivery-radius"
                    type="number"
                    value={newRule.delivery_radius_miles}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      delivery_radius_miles: parseInt(e.target.value) || 25
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="delivery-base">Base Delivery Fee ($)</Label>
                  <Input
                    id="delivery-base"
                    type="number"
                    step="0.01"
                    value={newRule.delivery_fee_base}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      delivery_fee_base: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="delivery-per-mile">Per Mile Fee ($)</Label>
                  <Input
                    id="delivery-per-mile"
                    type="number"
                    step="0.01"
                    value={newRule.delivery_fee_per_mile}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      delivery_fee_per_mile: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="auto-accept-threshold">Auto-Accept Threshold ($)</Label>
                  <Input
                    id="auto-accept-threshold"
                    type="number"
                    step="0.01"
                    value={newRule.auto_accept_threshold || ''}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      auto_accept_threshold: parseFloat(e.target.value) || undefined
                    })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requires-approval"
                  checked={newRule.requires_approval}
                  onCheckedChange={(checked) => setNewRule({
                    ...newRule,
                    requires_approval: checked
                  })}
                />
                <Label htmlFor="requires-approval">Requires manual approval</Label>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveRule} 
                  disabled={saving || !newRule.service_types?.length}
                >
                  {saving ? 'Saving...' : 'Save Rule'}
                </Button>
                <Button 
                  onClick={() => setShowNewRuleForm(false)} 
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorBusinessRulesForm;
