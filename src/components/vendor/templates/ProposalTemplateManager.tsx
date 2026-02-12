import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Edit, Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProposalTemplate {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  template_data: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface ProposalTemplateManagerProps {
  vendorId: string;
}

export const ProposalTemplateManager: React.FC<ProposalTemplateManagerProps> = ({ vendorId }) => {
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProposalTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_data: {},
    is_default: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, [vendorId]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_proposal_templates')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load proposal templates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      template_data: {},
      is_default: false
    });
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (template: ProposalTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      template_data: template.template_data,
      is_default: template.is_default
    });
    setIsDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    try {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('vendor_proposal_templates')
          .update({
            name: formData.name,
            description: formData.description,
            template_data: formData.template_data,
            is_default: formData.is_default,
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        
        toast({
          title: "Template Updated",
          description: "Proposal template has been updated successfully.",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('vendor_proposal_templates')
          .insert({
            vendor_id: vendorId,
            name: formData.name,
            description: formData.description,
            template_data: formData.template_data,
            is_default: formData.is_default,
          });

        if (error) throw error;
        
        toast({
          title: "Template Created",
          description: "New proposal template has been created successfully.",
        });
      }

      await fetchTemplates();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save proposal template.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('vendor_proposal_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      await fetchTemplates();
      toast({
        title: "Template Deleted",
        description: "Proposal template has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete proposal template.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (templateId: string) => {
    try {
      // First, remove default from all templates
      await supabase
        .from('vendor_proposal_templates')
        .update({ is_default: false })
        .eq('vendor_id', vendorId);

      // Then set the selected template as default
      const { error } = await supabase
        .from('vendor_proposal_templates')
        .update({ is_default: true })
        .eq('id', templateId);

      if (error) throw error;

      await fetchTemplates();
      toast({
        title: "Default Template Set",
        description: "This template is now your default proposal template.",
      });
    } catch (error) {
      console.error('Error setting default template:', error);
      toast({
        title: "Error",
        description: "Failed to set default template.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposal Templates
          </CardTitle>
          <Button onClick={handleCreateTemplate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No proposal templates yet</p>
            <p className="text-sm text-muted-foreground">Create your first template to speed up proposal creation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{template.name}</h4>
                    {template.is_default && (
                      <Badge variant="default" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!template.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(template.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Corporate Catering Package"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe when to use this template..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded"
                />
                <label className="text-sm">Set as default template</label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} disabled={!formData.name}>
                  {editingTemplate ? 'Update' : 'Create'} Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};