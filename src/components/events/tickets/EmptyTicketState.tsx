

import { Ticket } from 'lucide-react';

const EmptyTicketState = () => {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed rounded-lg p-8 text-center">
      <Ticket className="h-12 w-12 text-gray-400 mb-3" />
      <h3 className="text-lg font-medium">No tickets yet</h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Create ticket types for your event using the button above
      </p>
    </div>
  );
};

export default EmptyTicketState;
