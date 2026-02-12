
import React, { useState } from "react";
import { FileText, Mail, Plus, Edit, Trash2, Power, PowerOff, Tag } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EmailTemplateEditor } from "@/components/admin/email/EmailTemplateEditor";
import { useEmailManagement, EmailTemplate } from "@/hooks/admin/use-email-management";
import { format } from "date-fns";
import { PDFStudio } from "@/components/admin/pdf/PDFStudio";
import { LabelStudio } from "@/components/admin/labels/LabelStudio";

function ContentManagement() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  
  const {
    templates,
    loading,
    saveTemplate,
    deleteTemplate,
    sendTestEmail
  } = useEmailManagement();

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleSaveTemplate = async (templateData: Partial<EmailTemplate>) => {
    await saveTemplate(templateData);
    setShowEditor(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    await deleteTemplate(templateId);
  };

  const handleToggleTemplate = async (template: EmailTemplate) => {
    await saveTemplate({
      ...template,
      is_active: !template.is_active
    });
  };

  const getStatusBadge = (template: EmailTemplate) => {
    return template.is_active ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <Power className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        <PowerOff className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  if (showEditor) {
    return (
      <Dashboard userRole="admin" activeTab="content">
        <EmailTemplateEditor
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => setShowEditor(false)}
          onSendTest={sendTestEmail}
        />
      </Dashboard>
    );
  }

  return (
    <Dashboard userRole="admin" activeTab="content">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Content Management</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents (PDF)
            </TabsTrigger>
            <TabsTrigger value="labels" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Labels
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Website Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Email Templates</h2>
                <p className="text-gray-600">Manage email templates sent to users</p>
              </div>
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading email templates...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <p className="text-sm text-gray-600 capitalize">
                            {template.template_type.replace('_', ' ')}
                          </p>
                        </div>
                        {getStatusBadge(template)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-medium text-sm">Subject:</p>
                        <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium text-sm">Variables:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.variables?.slice(0, 3).map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                          {template.variables && template.variables.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.variables.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Updated: {format(new Date(template.updated_at), 'MMM d, yyyy')}
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleTemplate(template)}
                          >
                            {template.is_active ? (
                              <PowerOff className="h-3 w-3" />
                            ) : (
                              <Power className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Email Template</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{template.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && templates.length === 0 && (
              <div className="text-center py-12">
                <Mail className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No email templates</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first email template.</p>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <PDFStudio />
          </TabsContent>

          <TabsContent value="labels" className="space-y-6">
            <LabelStudio />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-center h-[400px] border border-dashed rounded-md">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-300" />
                <h2 className="mt-4 text-xl">Website Content Management</h2>
                <p className="mt-2 text-gray-500 max-w-md">
                  This section will provide tools to manage website content, blog posts, FAQs, and other content.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
};

export default ContentManagement;
