import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef } from "react";
import { Check } from "lucide-react";
import { parseDistanceFromRange } from "@/utils/delivery-calculations";

interface DeliveryRange {
  range: string;
  fee: number;
}

interface DeliveryRangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryRanges: DeliveryRange[];
  vendorName?: string;
  onSelectRange?: (range: DeliveryRange) => void;
  calculatedDistance?: number; // Distance in miles
  preselectedRange?: { range: string; fee: number }; // Pre-selected range from auto-calculation
}

export const DeliveryRangesModal = ({
  isOpen,
  onClose,
  deliveryRanges,
  vendorName,
  onSelectRange,
  calculatedDistance,
  preselectedRange
}: DeliveryRangesModalProps) => {
  // Track if we've already auto-applied for this distance to prevent duplicate calls
  const lastAppliedDistanceRef = useRef<number | null>(null);

  // Find the matching range based on calculated distance
  const matchingRange = useMemo(() => {
    if (!calculatedDistance || calculatedDistance <= 0) return null;

    for (const range of deliveryRanges) {
      const { min, max } = parseDistanceFromRange(range.range);
      if (calculatedDistance >= min && calculatedDistance <= max) {
        return range;
      }
    }
    return null;
  }, [calculatedDistance, deliveryRanges]);

  // Auto-apply delivery fee when distance is calculated and matching range is found
  useEffect(() => {
    if (!calculatedDistance || calculatedDistance <= 0 || !matchingRange || !onSelectRange) {
      return;
    }

    // Check if we've already applied for this distance
    if (lastAppliedDistanceRef.current === calculatedDistance) {
      return;
    }

    // Check if this range is already applied (preselected)
    if (preselectedRange && preselectedRange.range === matchingRange.range) {
      lastAppliedDistanceRef.current = calculatedDistance;
      return;
    }

    // Auto-apply the matching range
    lastAppliedDistanceRef.current = calculatedDistance;
    onSelectRange(matchingRange);
  }, [calculatedDistance, matchingRange, onSelectRange, preselectedRange]);

  // The applied range is either the preselected range or the matching range
  const appliedRange = preselectedRange || matchingRange;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delivery Ranges - {vendorName}</DialogTitle>
        </DialogHeader>
        {calculatedDistance !== undefined && calculatedDistance > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-blue-900 font-medium">
              📍 Calculated Distance: <span className="font-bold">{calculatedDistance.toFixed(1)} miles</span>
            </p>
            {appliedRange && (
              <p className="text-xs text-green-700 mt-1">
                ✓ Delivery fee automatically applied: <span className="font-semibold">${appliedRange.fee}</span> ({appliedRange.range})
              </p>
            )}
          </div>
        )}
        {!calculatedDistance && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p className="text-sm text-yellow-800">
              📍 Enter an event location to automatically calculate the delivery fee based on distance.
            </p>
          </div>
        )}
        <div className="space-y-3">
          {deliveryRanges.map((range, index) => {
            const isApplied = appliedRange?.range === range.range;
            const isMatchingRange = matchingRange?.range === range.range;

            // Show as not applicable if distance is calculated and this is NOT the matching range
            const isNotApplicable = calculatedDistance && calculatedDistance > 0 && !isMatchingRange;

            return (
              <div
                key={index}
                className={`w-full flex justify-between items-center p-3 rounded-lg transition-all ${
                  isNotApplicable
                    ? "bg-gray-100 border-2 border-gray-200 opacity-50"
                    : isApplied
                    ? "bg-green-50 border-2 border-green-500"
                    : "bg-gray-50 border-2 border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isNotApplicable ? 'text-gray-400' : ''}`}>
                    {range.range}
                  </span>
                  {isApplied && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Applied
                    </span>
                  )}
                  {isNotApplicable && (
                    <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                      Not in range
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${isNotApplicable ? 'text-gray-400' : isApplied ? 'text-green-600' : 'text-primary'}`}>
                    ${range.fee}
                  </span>
                  {isApplied && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
