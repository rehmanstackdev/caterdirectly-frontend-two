
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Plus, FileText, Calendar, Settings } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

const ActionDropdownMenu: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate('/vendor/create-service')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/vendor/new-proposal')}>
          <FileText className="h-4 w-4 mr-2" />
          New Proposal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/vendor/calendar')}>
          <Calendar className="h-4 w-4 mr-2" />
          Manage Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/vendor/settings')}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionDropdownMenu;
