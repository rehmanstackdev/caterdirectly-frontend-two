
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string | null;
  template_type: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface EmailSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name?: string | null;
  template_id?: string | null;
  subject: string;
  status: string;
  error_message?: string | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  opened_at?: string | null;
  clicked_at?: string | null;
  user_id?: string | null;
  metadata: any;
  created_at: string;
}

// Helper functions for type conversion
const convertJsonToStringArray = (json: Json | null): string[] => {
  if (!json) return [];
  if (Array.isArray(json)) return json.filter((item): item is string => typeof item === 'string');
  return [];
};

const convertStringArrayToJson = (arr: string[]): Json => {
  return arr as Json;
};

// Helper to convert database row to EmailTemplate
const convertDbRowToEmailTemplate = (row: any): EmailTemplate => ({
  id: row.id,
  name: row.name,
  subject: row.subject,
  html_content: row.html_content,
  text_content: row.text_content,
  template_type: row.template_type,
  variables: convertJsonToStringArray(row.variables),
  is_active: row.is_active,
  created_at: row.created_at,
  updated_at: row.updated_at,
  created_by: row.created_by,
  updated_by: row.updated_by
});

export function useEmailManagement() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [settings, setSettings] = useState<EmailSettings[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch email templates
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const convertedTemplates = (data || []).map(convertDbRowToEmailTemplate);
      setTemplates(convertedTemplates);
    } catch (error: any) {
      console.error('Error fetching email templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email templates',
        variant: 'destructive'
      });
    }
  };

  // Fetch email settings
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      console.error('Error fetching email settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email settings',
        variant: 'destructive'
      });
    }
  };

  // Fetch email logs
  const fetchLogs = async (limit = 100) => {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching email logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email logs',
        variant: 'destructive'
      });
    }
  };

  // Create or update email template
  const saveTemplate = async (template: Partial<EmailTemplate>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Prepare data for database with proper type conversion
      const dbData = {
        name: template.name,
        subject: template.subject,
        html_content: template.html_content,
        text_content: template.text_content,
        template_type: template.template_type,
        variables: template.variables ? convertStringArrayToJson(template.variables) : null,
        is_active: template.is_active
      };

      if (template.id) {
        // Update existing template
        const { error } = await supabase
          .from('email_templates')
          .update({
            ...dbData,
            updated_by: user.user?.id
          })
          .eq('id', template.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Email template updated successfully'
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('email_templates')
          .insert({
            ...dbData,
            created_by: user.user?.id,
            updated_by: user.user?.id
          });

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Email template created successfully'
        });
      }

      fetchTemplates();
    } catch (error: any) {
      console.error('Error saving email template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save email template',
        variant: 'destructive'
      });
    }
  };

  // Update email setting - with validation for critical platform settings
  const updateSetting = async (settingKey: string, settingValue: any) => {
    try {
      // Prevent changing core platform email settings
      if (settingKey === 'sender_email' || settingKey === 'sender_name' || settingKey === 'gmail_enabled') {
        toast({
          title: 'Information',
          description: 'Core email settings are managed at the platform level and cannot be modified',
          variant: 'default'
        });
        return;
      }

      const { error } = await supabase
        .from('email_settings')
        .update({ setting_value: settingValue })
        .eq('setting_key', settingKey);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Email setting updated successfully'
      });
      
      fetchSettings();
    } catch (error: any) {
      console.error('Error updating email setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update email setting',
        variant: 'destructive'
      });
    }
  };

  // Delete email template
  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Email template deleted successfully'
      });
      
      fetchTemplates();
    } catch (error: any) {
      console.error('Error deleting email template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete email template',
        variant: 'destructive'
      });
    }
  };

  // Send test email with enhanced logging
  const sendTestEmail = async (templateName: string, recipientEmail: string, variables: Record<string, string> = {}) => {
    try {
      console.log('Sending test email from info@caterdirectly.com:', { templateName, recipientEmail, variables });
      
      const response = await supabase.functions.invoke('send-email', {
        body: {
          templateName,
          recipientEmail,
          recipientName: 'Test User',
          variables,
          priority: 1
        }
      });

      console.log('Test email response:', response);

      if (response.error) {
        console.error('Test email error:', response.error);
        throw new Error(response.error.message || 'Failed to send test email');
      }

      toast({
        title: 'Success',
        description: 'Test email sent successfully from info@caterdirectly.com! Check the email logs for delivery status.'
      });
      
      // Refresh logs to show the new email
      setTimeout(() => fetchLogs(), 1000);
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Error',
        description: `Failed to send test email: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTemplates(),
        fetchSettings(),
        fetchLogs()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    templates,
    settings,
    logs,
    loading,
    saveTemplate,
    updateSetting,
    deleteTemplate,
    sendTestEmail,
    fetchTemplates,
    fetchSettings,
    fetchLogs
  };
}
