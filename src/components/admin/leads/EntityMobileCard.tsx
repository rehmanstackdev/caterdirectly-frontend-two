import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatDistanceToNow } from "date-fns";
import { Eye, User, Building, Mail, Calendar, ChevronDown, ChevronRight } from "lucide-react";
import { ContactSoonBadge } from "./ContactSoonBadge";
import { LeadStageSelect } from "./LeadStageSelect";
import { LeadAssignmentSelect } from "./LeadAssignmentSelect";
import { DuplicateWarningBadge } from "./DuplicateWarningBadge";
import { ConversionStatusBadge } from "./ConversionStatusBadge";
import type { UnifiedEntity, LeadStage } from "@/types/crm-types";

interface EntityMobileCardProps {
  entity: UnifiedEntity;
  onEntitySelect: (entity: UnifiedEntity) => void;
  onStageChange: (leadId: string, stage: LeadStage) => void;
  onAssignmentChange: (leadId: string, adminIds: string[]) => void;
}

export function EntityMobileCard({ 
  entity, 
  onEntitySelect, 
  onStageChange, 
  onAssignmentChange 
}: EntityMobileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-3 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {entity.type === 'user' ? (
              <User className="h-5 w-5 text-success flex-shrink-0" />
            ) : (
              <Building className="h-5 w-5 text-primary flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">
                {entity.full_name || entity.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span className="capitalize">{entity.type}</span>
                {entity.lead_type && (
                  <span>• {entity.lead_type.replace('_', ' ')} Lead</span>
                )}
              </div>
            </div>
          </div>
          
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        {/* Essential Info Always Visible */}
        <div className="space-y-2">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-1">
            {entity.type === 'user' ? (
              <>
                <Badge className="bg-success/10 text-success text-xs">
                  {entity.entity_label || 'User'}
                </Badge>
                {entity.roles && entity.roles.length > 0 && entity.roles.slice(0, 1).map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}
                  </Badge>
                ))}
                {entity.roles && entity.roles.length > 1 && (
                  <Badge variant="outline" className="text-xs">
                    +{entity.roles.length - 1}
                  </Badge>
                )}
              </>
            ) : (
              <>
                <DuplicateWarningBadge entity={entity} />
                <ConversionStatusBadge entity={entity} />
                {entity.type === 'lead' && (entity as any).has_upcoming_followup && (entity as any).next_followup && (
                  <ContactSoonBadge followupDate={(entity as any).next_followup} />
                )}
              </>
            )}
          </div>

          {/* Lead Controls for Mobile */}
          {entity.type === 'lead' && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">Stage</div>
                <LeadStageSelect
                  value={entity.lead_stage}
                  onChange={(stage) => onStageChange(entity.id, stage)}
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">Assigned To</div>
                <LeadAssignmentSelect
                  value={(entity as any).assigned_admin_users || []}
                  onChange={(adminIds) => onAssignmentChange(entity.id, adminIds)}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(entity.created_at), { addSuffix: true })}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEntitySelect(entity)}
              className="h-8 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="mt-3 pt-3 border-t border-border">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{entity.email}</span>
              </div>
              
              {entity.company_name && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="ml-2">{entity.company_name}</span>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}