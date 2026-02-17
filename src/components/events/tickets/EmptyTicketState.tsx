

import { Ticket } from 'lucide-react';

interface EmptyTicketStateProps {
  showRequiredError?: boolean;
}

const EmptyTicketState = ({ showRequiredError = false }: EmptyTicketStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center border rounded-lg p-8 text-center ${showRequiredError ? 'border-red-400 bg-red-50' : 'border-dashed'}`}>
      <Ticket className={`h-12 w-12 mb-3 ${showRequiredError ? 'text-red-400' : 'text-gray-400'}`} />
      <h3 className="text-lg font-medium">No tickets yet</h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Create ticket types for your event using the button above
      </p>
      {showRequiredError && (
        <p className="text-sm text-red-500 font-medium">
          Please add at least one ticket type to continue
        </p>
      )}
    </div>
  );
};

export default EmptyTicketState;
