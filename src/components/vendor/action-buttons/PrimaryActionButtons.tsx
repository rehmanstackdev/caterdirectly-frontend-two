
import React from 'react';
import { Plus, FileText } from 'lucide-react';
import ActionButton from './ActionButton';

const PrimaryActionButtons: React.FC = () => {
  return (
    <>
      <ActionButton 
        icon={Plus}
        label="Add Service"
        path="/vendor/create-service"
        variant="default"
        className="bg-[#F07712] hover:bg-[#F07712]/90 hidden sm:flex"
      />
      <ActionButton 
        icon={FileText}
        label="New Proposal"
        path="/vendor/new-proposal"
        variant="outline"
        className="hidden sm:flex"
      />
    </>
  );
};

export default PrimaryActionButtons;
