
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Save, Send, X } from 'lucide-react';
import { EmailTemplate } from '@/hooks/admin/use-email-management';

interface EmailTemplateEditorProps {
  template?: EmailTemplate | null;
  onSave: (template: Partial<EmailTemplate>) => void;
  onCancel: () => void;
  onSendTest: (templateName: string, email: string, variables: Record<string, string>) => void;
}

const TEMPLATE_TYPES = [
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'password_reset', label: 'Password Reset' },
  { value: 'order_confirmation', label: 'Order Confirmation' },
  { value: 'payment_confirmation', label: 'Payment Confirmation' },
  { value: 'event_reminder', label: 'Event Reminder' },
  { value: 'custom', label: 'Custom' }
];

const COMMON_VARIABLES = [
  'user_name', 'user_email', 'customer_name', 'order_title', 'order_total',
  'event_date', 'event_location', 'payment_amount', 'payment_method',
  'reset_url', 'login_url', 'company_name', 'platform_url'
];

export const EmailTemplateEditor = ({
  template,
  onSave,
  onCancel,
  onSendTest
}: EmailTemplateEditorProps) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_content: '',
    text_content: '',
    template_type: 'custom',
    variables: [] as string[],
    is_active: true
  });

  const [testEmail, setTestEmail] = useState('');
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewSize, setPreviewSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject,
        html_content: template.html_content,
        text_content: template.text_content || '',
        template_type: template.template_type,
        variables: template.variables || [],
        is_active: template.is_active
      });

      // Initialize test variables
      const initialTestVars: Record<string, string> = {};
      template.variables?.forEach(variable => {
        initialTestVars[variable] = getSampleValue(variable);
      });
      setTestVariables(initialTestVars);
    }
  }, [template]);

  const getSampleValue = (variable: string): string => {
    const samples: Record<string, string> = {
      user_name: 'John Doe',
      user_email: 'john@example.com',
      customer_name: 'Jane Smith',
      order_title: 'Birthday Party Catering',
      order_total: '299.99',
      event_date: 'December 25, 2024',
      event_location: '123 Main St, City, State',
      payment_amount: '299.99',
      payment_method: 'Credit Card',
      reset_url: 'https://platform.com/reset-password',
      login_url: 'https://platform.com/login',
      company_name: 'Our Platform',
      platform_url: 'https://platform.com'
    };
    return samples[variable] || `[${variable}]`;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVariableAdd = (variable: string) => {
    if (!formData.variables.includes(variable)) {
      const newVariables = [...formData.variables, variable];
      setFormData(prev => ({ ...prev, variables: newVariables }));
      setTestVariables(prev => ({ ...prev, [variable]: getSampleValue(variable) }));
    }
  };

  const handleVariableRemove = (variable: string) => {
    const newVariables = formData.variables.filter(v => v !== variable);
    setFormData(prev => ({ ...prev, variables: newVariables }));
    setTestVariables(prev => {
      const { [variable]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSave = () => {
    const templateData = {
      ...formData,
      id: template?.id
    };
    onSave(templateData);
  };

  const handleSendTest = () => {
    if (!testEmail || !formData.name) return;
    onSendTest(formData.name, testEmail, testVariables);
  };

  const insertVariable = (variable: string, field: 'subject' | 'html_content' | 'text_content') => {
    const variableText = `{{${variable}}}`;
    const currentValue = formData[field];
    handleInputChange(field, currentValue + variableText);
    handleVariableAdd(variable);
  };

  const renderPreview = () => {
    let previewHtml = formData.html_content;
    Object.entries(testVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewHtml = previewHtml.replace(regex, value);
    });
    return previewHtml;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {template ? 'Edit Email Template' : 'Create Email Template'}
        </h3>
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          {showPreview && (
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant={previewSize === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewSize('mobile')}
              >
                Mobile
              </Button>
              <Button
                variant={previewSize === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewSize('tablet')}
              >
                Tablet
              </Button>
              <Button
                variant={previewSize === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewSize('desktop')}
              >
                Desktop
              </Button>
            </div>
          )}
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., welcome_email"
                />
              </div>

              <div>
                <Label htmlFor="template_type">Template Type</Label>
                <Select value={formData.template_type} onValueChange={(value) => handleInputChange('template_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Email subject"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {COMMON_VARIABLES.map(variable => (
                    <Button
                      key={variable}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable, 'subject')}
                      className="text-xs"
                    >
                      {variable}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="html" className="w-full">
                <TabsList>
                  <TabsTrigger value="html">HTML Content</TabsTrigger>
                  <TabsTrigger value="text">Text Content</TabsTrigger>
                </TabsList>
                
                <TabsContent value="html" className="space-y-4">
                  <Textarea
                    value={formData.html_content}
                    onChange={(e) => handleInputChange('html_content', e.target.value)}
                    placeholder="HTML email content..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <div className="flex flex-wrap gap-1">
                    {COMMON_VARIABLES.map(variable => (
                      <Button
                        key={variable}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(variable, 'html_content')}
                        className="text-xs"
                      >
                        {variable}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="text" className="space-y-4">
                  <Textarea
                    value={formData.text_content}
                    onChange={(e) => handleInputChange('text_content', e.target.value)}
                    placeholder="Plain text email content..."
                    className="min-h-[300px]"
                  />
                  <div className="flex flex-wrap gap-1">
                    {COMMON_VARIABLES.map(variable => (
                      <Button
                        key={variable}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertVariable(variable, 'text_content')}
                        className="text-xs"
                      >
                        {variable}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {formData.variables.map(variable => (
                  <Badge key={variable} variant="secondary" className="flex items-center gap-1">
                    {variable}
                    <button
                      type="button"
                      onClick={() => handleVariableRemove(variable)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Email</CardTitle>
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
              </div>

              {formData.variables.length > 0 && (
                <div>
                  <Label>Test Variable Values</Label>
                  <div className="space-y-2 mt-2">
                    {formData.variables.map(variable => (
                      <div key={variable}>
                        <Label htmlFor={`var-${variable}`} className="text-sm">{variable}</Label>
                        <Input
                          id={`var-${variable}`}
                          value={testVariables[variable] || ''}
                          onChange={(e) => setTestVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                          placeholder={`Value for ${variable}`}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSendTest}
                disabled={!testEmail || !formData.name}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
            </CardContent>
          </Card>

          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Email Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full flex justify-center">
                  <div
                    className={`border rounded p-4 bg-white ${previewSize === 'mobile' ? 'w-[375px]' : previewSize === 'tablet' ? 'w-[768px]' : 'w-full'}`}
                    dangerouslySetInnerHTML={{ __html: renderPreview() }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
