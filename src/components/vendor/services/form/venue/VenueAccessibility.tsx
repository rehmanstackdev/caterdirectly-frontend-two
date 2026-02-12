
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface VenueAccessibilityProps {
  accessibilityFeatures: string[];
  updateAccessibilityFeatures: (features: string[]) => void;
}

const VenueAccessibility: React.FC<VenueAccessibilityProps> = ({
  accessibilityFeatures,
  updateAccessibilityFeatures
}) => {
  const handleFeatureChange = (feature: string, checked: boolean | "indeterminate") => {
    console.log(`Accessibility feature ${feature} changed to ${checked}`);
    const currentFeatures = Array.isArray(accessibilityFeatures) ? accessibilityFeatures : [];
    
    let newFeatures: string[];
    if (checked === true) {
      // Add feature if it doesn't already exist
      newFeatures = currentFeatures.includes(feature) ? 
        currentFeatures : [...currentFeatures, feature];
    } else {
      // Remove feature
      newFeatures = currentFeatures.filter(f => f !== feature);
    }
    
    console.log('Updated accessibility features:', newFeatures);
    updateAccessibilityFeatures(newFeatures);
  };

  // Ensure we're working with an array
  const features = Array.isArray(accessibilityFeatures) ? accessibilityFeatures : [];

  return (
    <div>
      <Label className="mb-2 block">Accessibility Features</Label>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="wheelchair" 
            checked={features.includes('Wheelchair accessible')}
            onCheckedChange={(checked) => handleFeatureChange('Wheelchair accessible', checked)}
          />
          <Label htmlFor="wheelchair">Wheelchair Accessible</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="elevator" 
            checked={features.includes('Elevator')}
            onCheckedChange={(checked) => handleFeatureChange('Elevator', checked)}
          />
          <Label htmlFor="elevator">Elevator</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="accessible-restroom" 
            checked={features.includes('Accessible restrooms')}
            onCheckedChange={(checked) => handleFeatureChange('Accessible restrooms', checked)}
          />
          <Label htmlFor="accessible-restroom">Accessible Restrooms</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="accessible-parking" 
            checked={features.includes('Accessible parking')}
            onCheckedChange={(checked) => handleFeatureChange('Accessible parking', checked)}
          />
          <Label htmlFor="accessible-parking">Accessible Parking</Label>
        </div>
      </div>
    </div>
  );
};

export default VenueAccessibility;
