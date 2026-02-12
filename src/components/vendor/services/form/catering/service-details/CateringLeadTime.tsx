
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CateringLeadTimeProps {
  leadTimeHours?: number;
  onLeadTimeChange: (value: number) => void;
}

const CateringLeadTime: React.FC<CateringLeadTimeProps> = ({
  leadTimeHours,
  onLeadTimeChange
}) => {
  const handleLeadTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onLeadTimeChange(isNaN(value) ? undefined : value);
  };

  return (
    <div>
      <Label htmlFor="lead-time" className="mb-2 block">Lead Time (hours)</Label>
      <Input
        id="lead-time"
        type="number"
        placeholder="24"
        value={leadTimeHours || ''}
        onChange={handleLeadTimeChange}
      />
      <p className="text-sm text-gray-500 mt-1">Minimum notice required before the event</p>
    </div>
  );
};

export default CateringLeadTime;
