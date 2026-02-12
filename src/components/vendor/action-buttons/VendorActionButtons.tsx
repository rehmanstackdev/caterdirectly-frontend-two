
import React from 'react';
import PrimaryActionButtons from './PrimaryActionButtons';
import ActionDropdownMenu from './ActionDropdownMenu';

const VendorActionButtons: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <PrimaryActionButtons />
      {/* <ActionDropdownMenu /> */}
    </div>
  );
};

export default VendorActionButtons;
