import React, { useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Eye, User, Building, Mail, Calendar } from "lucide-react";
import { ContactSoonBadge } from "./ContactSoonBadge";
import { LeadStageSelect } from "./LeadStageSelect";
import { LeadAssignmentSelect } from "./LeadAssignmentSelect";
import { DuplicateWarningBadge } from "./DuplicateWarningBadge";
import { ConversionStatusBadge } from "./ConversionStatusBadge";
import { EntityMobileCard } from "./EntityMobileCard";
import type { UnifiedEntity, LeadStage } from "@/types/crm-types";
import { LEAD_STAGE_INFO } from "@/types/crm-types";
import { useUpdateLeadStage } from "@/hooks/admin/use-leads";
import { useUpdateLeadAssignment } from "@/hooks/admin/use-lead-assignment";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnifiedEntityTableProps {
  entities: UnifiedEntity[];
  loading: boolean;
  onEntitySelect: (entity: UnifiedEntity) => void;
}

export function UnifiedEntityTable({ entities, loading, onEntitySelect }: UnifiedEntityTableProps) {
  const updateLeadStage = useUpdateLeadStage();
  const updateLeadAssignment = useUpdateLeadAssignment();
  const isMobile = useIsMobile();
  
  // Use all entities passed from parent - filtering is handled by the parent component
  const displayEntities = entities;

  const handleStageChange = useCallback((leadId: string, stage: LeadStage) => {
    updateLeadStage.mutate({ leadId, stage });
  }, [updateLeadStage]);

  const handleAssignmentChange = useCallback((leadId: string, adminIds: string[]) => {
    updateLeadAssignment.mutate({ leadId, adminIds });
  }, [updateLeadAssignment]);

  // Mobile Card Layout
  if (isMobile) {
    return (
      <div className="space-y-0">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-24 animate-shimmer" />
                  <Skeleton className="h-6 w-16 animate-shimmer" />
                </div>
                <Skeleton className="h-4 w-48 mb-2 animate-shimmer" />
                <Skeleton className="h-3 w-32 animate-shimmer" />
              </div>
            ))}
          </div>
        ) : displayEntities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No records found.
          </div>
        ) : (
          displayEntities.map((entity) => (
            <EntityMobileCard
              key={`${entity.type}-${entity.id}`}
              entity={entity}
              onEntitySelect={onEntitySelect}
              onStageChange={handleStageChange}
              onAssignmentChange={handleAssignmentChange}
            />
          ))
        )}
      </div>
    );
  }

  // Desktop/Tablet Table Layout
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Company</TableHead>
            <TableHead>Lead Stage</TableHead>
            <TableHead className="hidden sm:table-cell">Assigned To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <TableCell><Skeleton className="h-4 w-16 animate-shimmer" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32 animate-shimmer" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40 animate-shimmer" /></TableCell>
                <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24 animate-shimmer" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 animate-shimmer" /></TableCell>
                <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-24 animate-shimmer" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16 animate-shimmer" /></TableCell>
                <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20 animate-shimmer" /></TableCell>
                <TableCell><Skeleton className="h-8 w-16 animate-shimmer" /></TableCell>
              </TableRow>
            ))
          ) : displayEntities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No records found.
              </TableCell>
            </TableRow>
          ) : (
            displayEntities.map((entity) => (
              <TableRow key={`${entity.type}-${entity.id}`} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {entity.type === 'user' ? (
                      <User className="h-4 w-4 text-success" />
                    ) : (
                      <Building className="h-4 w-4 text-primary" />
                    )}
                    <span className="font-medium capitalize text-sm">{entity.type}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {entity.full_name || entity.email}
                    </div>
                    {entity.lead_type && (
                      <div className="text-xs text-muted-foreground capitalize">
                        {entity.lead_type.replace('_', ' ')} Lead
                      </div>
                    )}
                    {/* Show email on mobile when email column is hidden */}
                    <div className="text-xs text-muted-foreground md:hidden truncate mt-1">
                      {entity.email}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{entity.email}</span>
                  </div>
                </TableCell>
                
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm">
                    {entity.company_name || '—'}
                  </span>
                </TableCell>
                
                <TableCell>
                  {entity.type === 'lead' ? (
                    <LeadStageSelect
                      value={entity.lead_stage}
                      onChange={(stage) => handleStageChange(entity.id, stage)}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                
                <TableCell className="hidden sm:table-cell">
                  {entity.type === 'lead' ? (
                    <LeadAssignmentSelect
                      value={(entity as any).assigned_admin_users || []}
                      onChange={(adminIds) => handleAssignmentChange(entity.id, adminIds)}
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {entity.type === 'user' ? (
                      <>
                        <Badge className="bg-success/10 text-success w-fit text-xs">
                          {entity.entity_label || 'User'}
                        </Badge>
                        {entity.roles && entity.roles.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {entity.roles.slice(0, 2).map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                            {entity.roles.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{entity.roles.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        <DuplicateWarningBadge entity={entity} />
                        <ConversionStatusBadge entity={entity} />
                        {entity.type === 'lead' && (entity as any).has_upcoming_followup && (entity as any).next_followup && (
                          <ContactSoonBadge followupDate={(entity as any).next_followup} />
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(entity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEntitySelect(entity)}
                    className="flex items-center gap-2 h-8"
                  >
                    <Eye className="h-3 w-3" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}