import React from 'react';
import { ServiceItem } from '@/types/service-types';
import { calculateCommission, formatCommissionRate } from '@/utils/commission-utils';
import { DollarSign } from 'lucide-react';

interface CommissionDisplayProps {
  service: ServiceItem;
  commissionRate: number;
}

const CommissionDisplay: React.FC<CommissionDisplayProps> = ({ service, commissionRate }) => {
  const commission = calculateCommission(service, commissionRate);
  
  if (!commission) {
    return null;
  }
  
  return (
    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
      <div className="flex items-center justify-between text-sm">
        <span className="text-green-700 font-medium">Commission Rate: {formatCommissionRate(commissionRate)}</span>
        <span className="font-semibold text-green-800">{commission.formattedAmount}</span>
      </div>
    </div>
  );
};

export default CommissionDisplay;
