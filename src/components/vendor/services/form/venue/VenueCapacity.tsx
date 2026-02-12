
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface VenueCapacityProps {
  seatedCapacity: number | string;
  standingCapacity: number | string;
  updateCapacity: (seated: number | string, standing: number | string) => void;
}

const VenueCapacity: React.FC<VenueCapacityProps> = ({
  seatedCapacity,
  standingCapacity,
  updateCapacity
}) => {
  const handleSeatedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Seated capacity input value:', value);
    updateCapacity(value, standingCapacity);
  };

  const handleStandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Standing capacity input value:', value);
    updateCapacity(seatedCapacity, value);
  };

  // Ensure we have string values for the inputs
  const seatedValue = seatedCapacity !== undefined && seatedCapacity !== null ? seatedCapacity.toString() : '';
  const standingValue = standingCapacity !== undefined && standingCapacity !== null ? standingCapacity.toString() : '';

  return (
    <div>
      <Label className="mb-2 block">Venue Capacity</Label>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="seated-capacity" className="text-sm">Seated Capacity</Label>
          <Input
            id="seated-capacity"
            type="number"
            placeholder="100"
            value={seatedValue}
            onChange={handleSeatedChange}
          />
        </div>
        <div>
          <Label htmlFor="standing-capacity" className="text-sm">Standing Capacity</Label>
          <Input
            id="standing-capacity"
            type="number"
            placeholder="150"
            value={standingValue}
            onChange={handleStandingChange}
          />
        </div>
      </div>
    </div>
  );
};

export default VenueCapacity;
