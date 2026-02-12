import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Send, ThumbsUp, Trash2, FileText } from 'lucide-react';
import { VendorProposal } from '@/hooks/use-vendor-invoices';
import { useNavigate } from 'react-router-dom';

interface ProposalActionsMenuProps {
  proposal: VendorProposal;
  onStatusUpdate: (proposalId: string, status: string) => void;
  onSend: (proposalId: string) => void;
  onDelete: (proposalId: string) => void;
}

const ProposalActionsMenu: React.FC<ProposalActionsMenuProps> = ({
  proposal,
  onStatusUpdate,
  onSend,
  onDelete
}) => {
  const navigate = useNavigate();

  const handleView = () => {
    // Open invoice in new tab using the invoice token
    window.open(`/invoices/${proposal.token}`, '_blank');
  };

  const handleEdit = () => {
    navigate(`/vendor/invoices/${proposal.id}/edit?mode=invoice`);
  };

  const handleSend = () => {
    onSend(proposal.id);
  };

  const handleMarkAsPaid = () => {
    onStatusUpdate(proposal.id, 'paid');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      onDelete(proposal.id);
    }
  };

  const canEdit = proposal.status === 'draft';
  const canSend = proposal.status === 'draft';
  const canMarkAsPaid = proposal.status === 'accepted';
  const canDelete = ['draft', 'declined', 'expired'].includes(proposal.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          View Invoice
        </DropdownMenuItem>
        
        {canEdit && (
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        
        {canSend && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSend}>
              <Send className="mr-2 h-4 w-4" />
              Send to Client
            </DropdownMenuItem>
          </>
        )}
        
        {canMarkAsPaid && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleMarkAsPaid}>
              <ThumbsUp className="mr-2 h-4 w-4" />
              Mark as Paid
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem 
          onClick={() => window.open(`/invoices/${proposal.token}/pdf`, '_blank')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
        
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProposalActionsMenu;