import { useState, useEffect, useMemo, useCallback } from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUnifiedEntities, useEntityCounts } from "@/hooks/admin/use-unified-entities";
import { useLeads, useLeadPipelineStats } from "@/hooks/admin/use-leads";
import { CreateLeadDialog } from "@/components/admin/leads/CreateLeadDialog";
import { BulkLeadUploadDialog } from "@/components/admin/leads/BulkLeadUploadDialog";
import { LeadKanbanBoard } from "@/components/admin/leads/LeadKanbanBoard";
import { UnifiedEntityTable } from "@/components/admin/leads/UnifiedEntityTable";
import { LeadDetailModal } from "@/components/admin/leads/LeadDetailModal";
import { PipelineStatsCards } from "@/components/admin/leads/PipelineStatsCards";
import type { UnifiedFilters, LeadFilters, ViewMode, UnifiedEntity, Lead } from "@/types/crm-types";
import { Users, UserPlus, Kanban, Table as TableIcon, Search, Filter, Upload } from "lucide-react";

function LeadManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedEntity, setSelectedEntity] = useState<UnifiedEntity | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // Unified filters for the main table view
  const [unifiedFilters, setUnifiedFilters] = useState<UnifiedFilters>({
    searchQuery: '',
    entityType: 'all',
    userType: 'all',
    leadType: 'all',
    status: 'all'
  });

  // Lead-specific filters for kanban view
  const [leadFilters, setLeadFilters] = useState<LeadFilters>({
    searchQuery: '',
    leadType: 'all',
    leadStage: 'all',
    assignedTo: 'all',
    priorityLevel: 'all',
    source: 'all'
  });

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setUnifiedFilters(prev => ({ ...prev, searchQuery: debounced }));
    setLeadFilters(prev => ({ ...prev, searchQuery: debounced }));
  }, [debounced]);

  useEffect(() => {
    document.title = "Lead Management | Admin";
  }, []);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedUnifiedFilters = useMemo(() => unifiedFilters, [unifiedFilters]);
  const memoizedLeadFilters = useMemo(() => leadFilters, [leadFilters]);
  const { data: unifiedEntities, isLoading: unifiedLoading } = useUnifiedEntities(memoizedUnifiedFilters);
  const { data: leads, isLoading: leadsLoading } = useLeads(memoizedLeadFilters);

  const { data: entityCounts } = useEntityCounts();
  // Only fetch pipeline stats when in kanban view to avoid unnecessary API calls
  const { data: pipelineStats } = useLeadPipelineStats(viewMode === 'kanban');

  const handleEntitySelect = useCallback((entity: UnifiedEntity) => {
    setSelectedEntity(entity);
    if (entity.type === 'lead') {
      // Try to find lead in loaded leads, otherwise create minimal lead object from entity
      // The LeadDetailModal will fetch the full lead data by ID
      const lead = leads?.find(l => l.id === entity.id);
      if (lead) {
        setSelectedLead(lead);
      } else {
        // Create minimal lead object from entity - modal will fetch full data
        setSelectedLead({
          id: entity.id,
          email: entity.email,
          first_name: entity.first_name || null,
          last_name: entity.last_name || null,
          full_name: entity.full_name || entity.email,
          lead_stage: entity.lead_stage || 'new',
        } as any);
      }
    }
  }, [leads]);

  return (
    <Dashboard userRole="admin" activeTab="leads">
      <main className="space-y-6">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div>
              <h1 className="text-2xl font-bold">Lead Management</h1>
              <p className="text-muted-foreground">Manage leads, users, and sales pipeline.</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setBulkUploadOpen(true)} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Bulk Upload
              </Button>
              <Button onClick={() => setCreateLeadOpen(true)} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Lead
              </Button>
            </div>
          </div>

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search leads and users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                aria-label="Search leads and users"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="flex items-center gap-2"
              >
                <TableIcon className="h-4 w-4" />
                Table
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="flex items-center gap-2"
              >
                <Kanban className="h-4 w-4" />
                Pipeline
              </Button>
            </div>
          </div>

          {/* Entity Count Summary */}
          {entityCounts && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  unifiedFilters.entityType === 'leads' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setViewMode('table');
                  setUnifiedFilters(prev => ({ 
                    ...prev, 
                    entityType: 'leads',
                    userType: 'all',
                    leadType: 'all',
                    status: 'all'
                  }));
                }}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{entityCounts.leads.total}</div>
                    <div className="text-sm text-muted-foreground">Total Leads</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  unifiedFilters.entityType === 'leads' && unifiedFilters.status === 'active' ? 'ring-2 ring-success bg-success/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setViewMode('table');
                  setUnifiedFilters(prev => ({ 
                    ...prev, 
                    entityType: 'leads',
                    userType: 'all',
                    leadType: 'all',
                    status: 'active'
                  }));
                }}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{entityCounts.leads.active}</div>
                    <div className="text-sm text-muted-foreground">Active Leads</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  unifiedFilters.entityType === 'users' && unifiedFilters.userType === 'all' ? 'ring-2 ring-accent bg-accent/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setViewMode('table');
                  setUnifiedFilters(prev => ({ 
                    ...prev, 
                    entityType: 'users',
                    userType: 'all',
                    leadType: 'all',
                    status: 'all'
                  }));
                }}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-foreground">{entityCounts.users.total}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  unifiedFilters.entityType === 'users' && unifiedFilters.userType === 'vendor' ? 'ring-2 ring-brand bg-brand/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setViewMode('table');
                  setUnifiedFilters(prev => ({ 
                    ...prev, 
                    entityType: 'users',
                    userType: 'vendor',
                    leadType: 'all',
                    status: 'all'
                  }));
                }}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand">{entityCounts.users.vendor}</div>
                    <div className="text-sm text-muted-foreground">Vendors</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  unifiedFilters.entityType === 'users' && unifiedFilters.userType === 'event_host' ? 'ring-2 ring-secondary bg-secondary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setViewMode('table');
                  setUnifiedFilters(prev => ({ 
                    ...prev, 
                    entityType: 'users',
                    userType: 'event_host',
                    leadType: 'all',
                    status: 'all'
                  }));
                }}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary-foreground">{entityCounts.users.event_host}</div>
                    <div className="text-sm text-muted-foreground">Event Hosts</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  unifiedFilters.entityType === 'users' && unifiedFilters.userType === 'admin' ? 'ring-2 ring-destructive bg-destructive/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setViewMode('table');
                  setUnifiedFilters(prev => ({ 
                    ...prev, 
                    entityType: 'users',
                    userType: 'admin',
                    leadType: 'all',
                    status: 'all'
                  }));
                }}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">{entityCounts.users.admin}</div>
                    <div className="text-sm text-muted-foreground">Admins</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </header>

        {/* Pipeline Stats for Kanban View */}
        {viewMode === 'kanban' && pipelineStats && (
          <PipelineStatsCards stats={pipelineStats} />
        )}

        {/* Filter Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {viewMode === 'table' ? (
            <>
              <Select
                value={unifiedFilters.entityType}
                onValueChange={(value) => setUnifiedFilters(prev => ({ ...prev, entityType: value as any }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="leads">Leads Only</SelectItem>
                  <SelectItem value="users">Users Only</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={unifiedFilters.userType}
                onValueChange={(value) => setUnifiedFilters(prev => ({ ...prev, userType: value as any }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="event_host">Event Host</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={unifiedFilters.leadType}
                onValueChange={(value) => setUnifiedFilters(prev => ({ ...prev, leadType: value as any }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Lead Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lead Types</SelectItem>
                  <SelectItem value="vendor">Vendor Leads</SelectItem>
                  <SelectItem value="event_host">Event Host Leads</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={unifiedFilters.status}
                onValueChange={(value) => setUnifiedFilters(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Select
                value={leadFilters.leadType}
                onValueChange={(value) => setLeadFilters(prev => ({ ...prev, leadType: value as any }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Lead Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="event_host">Event Host</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={leadFilters.priorityLevel.toString()}
                onValueChange={(value) => setLeadFilters(prev => ({ ...prev, priorityLevel: value === 'all' ? 'all' : parseInt(value) }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="1">High (1)</SelectItem>
                  <SelectItem value="2">Medium-High (2)</SelectItem>
                  <SelectItem value="3">Medium (3)</SelectItem>
                  <SelectItem value="4">Medium-Low (4)</SelectItem>
                  <SelectItem value="5">Low (5)</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={leadFilters.assignedTo}
                onValueChange={(value) => setLeadFilters(prev => ({ ...prev, assignedTo: value }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Follow-ups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leads</SelectItem>
                  <SelectItem value="follow_up_due">Follow-ups Due</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Main Content Area */}
        {(viewMode === 'table' ? unifiedLoading : leadsLoading) ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading data...</p>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <UnifiedEntityTable
            entities={unifiedEntities || []}
            loading={false}
            onEntitySelect={handleEntitySelect}
          />
        ) : (
          <LeadKanbanBoard
            leads={leads || []}
            loading={false}
            onLeadSelect={(lead) => setSelectedLead(lead)}
          />
        )}
      </main>

      {/* Modals */}
      <CreateLeadDialog
        isOpen={createLeadOpen}
        onClose={() => setCreateLeadOpen(false)}
      />

      <BulkLeadUploadDialog
        isOpen={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
      />

      {selectedLead && (
        <LeadDetailModal
          leadId={selectedLead.id}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </Dashboard>
  );
}

export default LeadManagement;