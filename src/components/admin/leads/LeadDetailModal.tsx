import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Phone, Building, User, Calendar, DollarSign, AlertCircle, Bell } from "lucide-react";
import { useLead } from "@/hooks/admin/use-leads";
import { FollowupScheduler } from "./FollowupScheduler";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { LEAD_STAGE_INFO } from "@/types/crm-types";

interface LeadDetailModalProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDetailModal({ leadId, isOpen, onClose }: LeadDetailModalProps) {
  const { data, isLoading } = useLead(leadId);
  const [followupOpen, setFollowupOpen] = useState(false);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!data?.lead) {
    return null;
  }

  const { lead, activities } = data;
  const stageInfo = LEAD_STAGE_INFO[lead.lead_stage];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{lead.full_name || lead.email}</span>
              </div>
              {lead.stage_info && (
                <Badge className={lead.stage_info.color}>
                  {lead.stage_info.displayName}
                </Badge>
              )}
            </DialogTitle>
            <Button
              onClick={() => setFollowupOpen(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Schedule Follow-up
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{lead.full_name || lead.email}</h2>
              {lead.company_name && (
                <p className="text-gray-600">{lead.company_name}</p>
              )}
              <p className="text-sm text-gray-500">{lead.email}</p>
            </div>
            <div className="text-right">
              <Badge className={stageInfo.color}>
                {stageInfo.displayName}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                {lead.lead_type === 'vendor' ? 'Vendor Lead' : 'Event Host Lead'}
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(lead.estimated_value || 0)}
              </div>
              <div className="text-sm text-gray-600">Estimated Value</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {lead.priority_level}
              </div>
              <div className="text-sm text-gray-600">Priority Level</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {activities.length}
              </div>
              <div className="text-sm text-gray-600">Activities</div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-medium mb-2">Contact Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Email:</strong> {lead.email}</div>
              <div><strong>Phone:</strong> {lead.phone || '—'}</div>
              <div><strong>Job Title:</strong> {lead.job_title || '—'}</div>
              <div><strong>Company:</strong> {lead.company_name || '—'}</div>
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <h3 className="font-medium mb-2">Recent Activities</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="border-l-2 border-blue-200 pl-3 py-1">
                  <div className="font-medium text-sm">{activity.title}</div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-gray-500">No activities yet</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      <FollowupScheduler
        isOpen={followupOpen}
        onClose={() => setFollowupOpen(false)}
        leadId={leadId}
        leadName={lead.full_name || lead.email}
      />
    </Dialog>
  );
}