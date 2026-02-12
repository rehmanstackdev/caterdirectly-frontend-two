
import React from 'react';
import { Clock } from "lucide-react";

interface OrderHeaderProps {
  timeRemaining: string;
}

const OrderHeader = ({ timeRemaining }: OrderHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold">Group Order Summary</h2>
      {timeRemaining && (
        <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          <Clock className="h-4 w-4 text-amber-500" />
          <span className="font-medium">Guest selection cutoff: {timeRemaining}</span>
        </div>
      )}
    </div>
  );
};

export default OrderHeader;
