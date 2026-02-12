import React from "react";
import { ContactSoonBadge } from "./ContactSoonBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateLeadStage } from "@/hooks/admin/use-leads";
import { useResponsiveKanban } from "@/hooks/use-responsive-kanban";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Building, Mail, Phone, Calendar, DollarSign, User, Eye } from "lucide-react";
import type { Lead, LeadStage } from "@/types/crm-types";
import { LEAD_STAGE_INFO } from "@/types/crm-types";

interface LeadKanbanBoardProps {
  leads: Lead[];
  loading: boolean;
  onLeadSelect: (lead: Lead) => void;
}

interface KanbanColumnProps {
  stage: LeadStage;
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: LeadStage) => void;
}

function KanbanColumn({ stage, leads, onLeadSelect, onStageChange }: KanbanColumnProps) {
  const stageInfo = LEAD_STAGE_INFO[stage];
  const stageLeads = leads.filter(lead => lead.lead_stage === stage);
  const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  const { columnWidth } = useResponsiveKanban();

  return (
    <div className="flex-shrink-0" style={{ width: columnWidth }}>
      <Card className="h-full">
        <CardHeader className="pb-3 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2 min-w-0">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${stageInfo.color.split(' ')[0]}`}></span>
              <span className="truncate">{stageInfo.displayName}</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {stageLeads.length}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">{stageInfo.description}</p>
          {totalValue > 0 && (
            <p className="text-xs font-medium text-success">
              {formatCurrency(totalValue)} total value
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0 p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3 max-h-[50vh] sm:max-h-[600px] overflow-y-auto">
            {stageLeads.map((lead) => (
              <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {/* Lead Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {lead.full_name || lead.email}
                        </h4>
                        {lead.company_name && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{lead.company_name}</span>
                          </div>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs flex-shrink-0 ${lead.lead_type === 'vendor' ? 'border-brand/30 text-brand' : 'border-primary/30 text-primary'}`}
                      >
                        {lead.lead_type === 'vendor' ? 'Vendor' : 'Event Host'}
                      </Badge>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{lead.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Lead Details */}
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {lead.estimated_value > 0 && (
                        <div className="flex items-center gap-1 text-success font-medium flex-shrink-0">
                          <DollarSign className="h-3 w-3" />
                          <span className="truncate">
                            {formatCurrency(lead.estimated_value)}
                          </span>
                        </div>
                      )}
                    </div>

                     {/* Contact Soon Badge */}
                     {lead.has_upcoming_followup && lead.next_followup && (
                       <ContactSoonBadge followupDate={lead.next_followup} />
                     )}

                     {/* Priority Indicator */}
                     {lead.priority_level <= 2 && (
                       <div className="flex items-center gap-1">
                         <div className={`w-2 h-2 rounded-full flex-shrink-0 ${lead.priority_level === 1 ? 'bg-destructive' : 'bg-brand'}`}></div>
                         <span className="text-xs font-medium truncate">
                           {lead.priority_level === 1 ? 'High Priority' : 'Medium-High Priority'}
                         </span>
                       </div>
                     )}

                    {/* Assigned Users */}
                    {lead.assigned_admin_users && lead.assigned_admin_users.length > 0 && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          Assigned to {lead.assigned_admin_users.length} admin(s)
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
                      <Select
                        value={lead.lead_stage}
                        onValueChange={(newStage: LeadStage) => onStageChange(lead.id, newStage)}
                      >
                        <SelectTrigger className="h-7 text-xs w-full sm:w-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(LEAD_STAGE_INFO).map(([stage, info]) => (
                            <SelectItem key={stage} value={stage}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${info.color.split(' ')[0]}`} />
                                <span className="text-xs">{info.displayName}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onLeadSelect(lead)}
                        className="h-7 px-2 w-full sm:w-auto"
                      >
                        <Eye className="h-3 w-3" />
                        <span className="ml-1 sm:hidden">View Lead</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {stageLeads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No leads in this stage</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LeadKanbanBoard({ leads, loading, onLeadSelect }: LeadKanbanBoardProps) {
  const updateLeadStage = useUpdateLeadStage();

  const handleStageChange = async (leadId: string, newStage: LeadStage) => {
    try {
      await updateLeadStage.mutateAsync({ leadId, stage: newStage });
    } catch (error) {
      console.error('Error updating lead stage:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  const stages: LeadStage[] = ['new', 'contacted', 'interested', 'follow_up_needed', 'not_interested'];

  return (
    <div className="space-y-4">
      {/* Main Pipeline Stages */}
      <div className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto pb-4 px-1">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={leads}
            onLeadSelect={onLeadSelect}
            onStageChange={handleStageChange}
          />
        ))}
      </div>

      {/* Won/Lost Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <KanbanColumn
          stage="won"
          leads={leads}
          onLeadSelect={onLeadSelect}
          onStageChange={handleStageChange}
        />
        <KanbanColumn
          stage="lost"
          leads={leads}
          onLeadSelect={onLeadSelect}
          onStageChange={handleStageChange}
        />
      </div>
    </div>
  );
}