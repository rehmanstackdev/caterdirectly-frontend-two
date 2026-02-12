import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { VendorProposal } from '@/hooks/use-vendor-invoices';
import ProposalActionsMenu from './ProposalActionsMenu';
import { Loader2, Trash2 } from 'lucide-react';

interface ProposalsTableProps {
  proposals: VendorProposal[];
  loading: boolean;
  error: string | null;
  onStatusUpdate: (proposalId: string, status: string) => void;
  onSend: (proposalId: string) => void;
  onDelete: (proposalId: string) => void;
}

const getStatusColor = (status: string): string => {
  switch(status) {
    case 'draft': return 'bg-gray-200 text-gray-800';
    case 'sent': return 'bg-blue-100 text-blue-800';
    case 'accepted': return 'bg-green-100 text-green-800';
    case 'paid': return 'bg-purple-100 text-purple-800';
    case 'declined': return 'bg-red-100 text-red-800';
    case 'expired': return 'bg-yellow-100 text-yellow-800';
    case 'revision_requested': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string): string => {
  switch(status) {
    case 'draft': return 'Draft';
    case 'sent': return 'Sent';
    case 'accepted': return 'Accepted';
    case 'paid': return 'Paid';
    case 'declined': return 'Declined';
    case 'expired': return 'Expired';
    case 'revision_requested': return 'Revision Requested';
    default: return status;
  }
};

// Safe date formatter that handles invalid dates gracefully
const formatSafeDate = (dateValue: string | null | undefined, formatStr: string = 'MMM d, yyyy'): string => {
  if (!dateValue) return 'N/A';
  
  const date = new Date(dateValue);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  try {
    return format(date, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error, 'for value:', dateValue);
    return 'Invalid date';
  }
};

const ProposalsTable: React.FC<ProposalsTableProps> = ({
  proposals,
  loading,
  error,
  onStatusUpdate,
  onSend,
  onDelete
}) => {
  const [selectedProposalIds, setSelectedProposalIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select deletable proposals
      const deletableIds = proposals
        .filter(p => ['draft', 'declined', 'expired'].includes(p.status))
        .map(p => p.id);
      setSelectedProposalIds(deletableIds);
    } else {
      setSelectedProposalIds([]);
    }
  };

  const handleSelectProposal = (proposalId: string, checked: boolean) => {
    if (checked) {
      setSelectedProposalIds(prev => [...prev, proposalId]);
    } else {
      setSelectedProposalIds(prev => prev.filter(id => id !== proposalId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProposalIds.length === 0) return;
    
    for (const proposalId of selectedProposalIds) {
      await onDelete(proposalId);
    }
    
    setSelectedProposalIds([]);
  };

  const isDeletable = (status: string) => {
    return ['draft', 'declined', 'expired'].includes(status);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p className="text-gray-500">Loading proposals...</p>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No proposals found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedProposalIds.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium text-blue-900">
                  {selectedProposalIds.length} proposal{selectedProposalIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected Proposals
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedProposalIds.length} Proposal{selectedProposalIds.length !== 1 ? 's' : ''}</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to permanently delete these proposals? This action cannot be undone.
                      <div className="mt-2 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-sm">
                        {proposals.filter(p => selectedProposalIds.includes(p.id)).map(p => (
                          <div key={p.id} className="py-1">• {p.title || 'Untitled Proposal'}</div>
                        ))}
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Delete {selectedProposalIds.length} Proposal{selectedProposalIds.length !== 1 ? 's' : ''}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-4 px-6 text-left">
                <Checkbox
                  checked={selectedProposalIds.length > 0 && selectedProposalIds.length === proposals.filter(p => isDeletable(p.status)).length}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="py-4 px-6 text-left font-medium text-gray-500">Proposal</th>
              <th className="py-4 px-6 text-left font-medium text-gray-500">Client</th>
              <th className="py-4 px-6 text-left font-medium text-gray-500">Date</th>
              <th className="py-4 px-6 text-left font-medium text-gray-500">Amount</th>
              <th className="py-4 px-6 text-left font-medium text-gray-500">Status</th>
              <th className="py-4 px-6 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) => (
              <tr key={proposal.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-6">
                  {isDeletable(proposal.status) && (
                    <Checkbox
                      checked={selectedProposalIds.includes(proposal.id)}
                      onCheckedChange={(checked) => handleSelectProposal(proposal.id, checked as boolean)}
                    />
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="font-medium">{proposal.title || 'Untitled Proposal'}</div>
                  <div className="text-sm text-gray-500">ID: {proposal.id}</div>
                </td>
                <td className="py-4 px-6">
                  <div>{proposal.client_name}</div>
                  <div className="text-sm text-gray-500">{proposal.client_email}</div>
                  {proposal.client_company && (
                    <div className="text-sm text-gray-500">{proposal.client_company}</div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div>{formatSafeDate(proposal.created_at)}</div>
                  {proposal.expires_at && (
                    <div className="text-sm text-gray-500">
                      Expires: {formatSafeDate(proposal.expires_at)}
                    </div>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="font-medium">${(proposal.total || 0).toFixed(2)}</div>
                </td>
                <td className="py-4 px-6">
                  <Badge className={`${getStatusColor(proposal.status)}`}>
                    {getStatusLabel(proposal.status)}
                  </Badge>
                  {proposal.status === 'revision_requested' && proposal.revision_message && (
                    <div className="text-sm text-orange-600 mt-1">
                      Revision needed
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  <ProposalActionsMenu
                    proposal={proposal}
                    onStatusUpdate={onStatusUpdate}
                    onSend={onSend}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProposalsTable;
