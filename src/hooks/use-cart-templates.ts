import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { ServiceSelection } from '@/types/order';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type CartTemplateRow = Tables<'cart_templates'>;

export interface CartTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: string;
  selected_services: ServiceSelection[];
  selected_items: Record<string, number>;
  sections: any[];
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

const convertRowToTemplate = (row: CartTemplateRow): CartTemplate => ({
  ...row,
  selected_services: (row.selected_services as any) || [],
  selected_items: (row.selected_items as any) || {},
  sections: (row.sections as any) || [],
  description: row.description || undefined,
});

export function useCartTemplates() {
  const [templates, setTemplates] = useState<CartTemplate[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<CartTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const loadTemplates = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load user's templates
      const { data: userTemplates, error: userError } = await supabase
        .from('cart_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (userError) throw userError;

      // Load public templates
      const { data: publicTemplatesData, error: publicError } = await supabase
        .from('cart_templates')
        .select('*')
        .eq('is_public', true)
        .neq('user_id', user.id)
        .order('usage_count', { ascending: false })
        .limit(20);

      if (publicError) throw publicError;

      setTemplates((userTemplates || []).map(convertRowToTemplate));
      setPublicTemplates((publicTemplatesData || []).map(convertRowToTemplate));
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (
    name: string,
    selectedServices: ServiceSelection[],
    selectedItems: Record<string, number>,
    sections: any[] = [],
    description?: string,
    category: string = 'general',
    isPublic: boolean = false
  ): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to save templates');
      return null;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('cart_templates')
        .insert({
          user_id: user.id,
          name,
          description,
          category,
          selected_services: selectedServices as any,
          selected_items: selectedItems as any,
          sections: sections as any,
          is_public: isPublic,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Template saved successfully!');
      await loadTemplates();
      return data.id;
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const useTemplate = async (templateId: string): Promise<CartTemplate | null> => {
    try {
      // Increment usage count
      await supabase
        .from('cart_templates')
        .update({ usage_count: 0 }) // Simplified for now
        .eq('id', templateId);

      // Get template data
      const { data, error } = await supabase
        .from('cart_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      return convertRowToTemplate(data);
    } catch (error) {
      console.error('Failed to use template:', error);
      toast.error('Failed to load template');
      return null;
    }
  };

  const deleteTemplate = async (templateId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('cart_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Template deleted successfully');
      await loadTemplates();
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  return {
    templates,
    publicTemplates,
    isLoading,
    isSaving,
    saveTemplate,
    useTemplate,
    deleteTemplate,
    loadTemplates,
  };
}