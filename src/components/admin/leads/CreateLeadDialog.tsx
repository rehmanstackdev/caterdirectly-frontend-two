import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLead, useCheckDuplicates } from "@/hooks/admin/use-leads";
import { toast } from "sonner";
import { AlertTriangle, User, Building, Mail, Phone, Briefcase } from "lucide-react";
import type { CreateLeadForm, LeadType } from "@/types/crm-types";

interface CreateLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLeadDialog({ isOpen, onClose }: CreateLeadDialogProps) {
  const [formData, setFormData] = useState<CreateLeadForm>({
    email: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    job_title: '',
    lead_type: 'event_host',
    priority_level: 3,
    estimated_value: 0,
    expected_close_date: '',
    source: '',
    assigned_admin_users: [],
    affiliate_id: '',
    notes: ''
  });

  const [duplicateCheck, setDuplicateCheck] = useState<any[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);

  const createLead = useCreateLead();
  const checkDuplicates = useCheckDuplicates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Email is required');
      return;
    }

    // Check for duplicates first
    try {
      const emailDomain = formData.email.includes('@') ? formData.email.split('@')[1].toLowerCase() : undefined;
      const duplicates = await checkDuplicates.mutateAsync({
        email: formData.email,
        company_domain: emailDomain
      });

      if (duplicates.length > 0) {
        setDuplicateCheck(duplicates);
        setShowDuplicates(true);
        return;
      }

      // No duplicates, proceed with creation
      const payload = { ...formData, assigned_admin_users: (formData.assigned_admin_users || []).filter(Boolean) } as CreateLeadForm;
      await createLead.mutateAsync(payload);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleForceCreate = async () => {
    try {
      const payload = { ...formData, assigned_admin_users: (formData.assigned_admin_users || []).filter(Boolean) } as CreateLeadForm;
      await createLead.mutateAsync(payload);
      onClose();
      resetForm();
      setShowDuplicates(false);
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      company_name: '',
      phone: '',
      job_title: '',
      lead_type: 'event_host',
      priority_level: 3,
      estimated_value: 0,
      expected_close_date: '',
      source: '',
      assigned_admin_users: [],
      affiliate_id: '',
      notes: ''
    });
    setDuplicateCheck([]);
    setShowDuplicates(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
        </DialogHeader>

        {showDuplicates && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Potential Duplicates Found</span>
            </div>
            <div className="space-y-2 mb-4">
              {duplicateCheck.map((dup, index) => (
                <div key={index} className="text-sm text-yellow-700">
                  {dup.is_user ? (
                    <span>Existing user found with this email</span>
                  ) : (
                    <span>Existing lead found with this email</span>
                  )}
                  {dup.company_match && (
                    <span> (same company domain)</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDuplicates(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleForceCreate}
                disabled={createLead.isPending}
              >
                Create Anyway
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="job_title">Job Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lead Details */}
          <div className="space-y-4">
            <h3 className="font-medium">Lead Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lead_type">Lead Type *</Label>
                <Select
                  value={formData.lead_type}
                  onValueChange={(value: LeadType) => setFormData(prev => ({ ...prev, lead_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="event_host">Event Host</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority_level">Priority Level</Label>
                <Select
                  value={formData.priority_level.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority_level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">High (1)</SelectItem>
                    <SelectItem value="2">Medium-High (2)</SelectItem>
                    <SelectItem value="3">Medium (3)</SelectItem>
                    <SelectItem value="4">Medium-Low (4)</SelectItem>
                    <SelectItem value="5">Low (5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="estimated_value">Estimated Value ($)</Label>
                <Input
                  id="estimated_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimated_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="expected_close_date">Expected Close Date</Label>
                <Input
                  id="expected_close_date"
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_close_date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="e.g., Website, Referral, Cold Call"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this lead..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLead.isPending || showDuplicates}>
              {createLead.isPending ? 'Creating...' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}