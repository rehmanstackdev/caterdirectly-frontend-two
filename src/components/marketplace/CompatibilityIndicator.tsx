

import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { ServiceItem } from '@/types/service-types';
import { ServiceSelection } from '@/types/order';
import { useServiceCompatibility } from '@/hooks/use-service-compatibility';

interface CompatibilityIndicatorProps {
  service: ServiceItem;
  existingServices: ServiceSelection[];
  className?: string;
}

const CompatibilityIndicator = ({
  service,
  existingServices,
  className = ''
}: CompatibilityIndicatorProps) => {
  const { checkServiceCompatibility } = useServiceCompatibility(existingServices);
  
  if (existingServices.length === 0) {
    return null;
  }

  const compatibility = checkServiceCompatibility(service);

  if (!compatibility.isCompatible) {
    return (
      <div className={`space-y-1 ${className}`}>
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Not Compatible
        </Badge>
        {compatibility.reasons.map((reason, index) => (
          <p key={index} className="text-xs text-red-600">{reason}</p>
        ))}
      </div>
    );
  }

  if (compatibility.warnings.length > 0) {
    return (
      <div className={`space-y-1 ${className}`}>
        <Badge variant="outline" className="flex items-center gap-1 border-yellow-500 text-yellow-700">
          <AlertTriangle className="h-3 w-3" />
          Needs Verification
        </Badge>
        {compatibility.warnings.map((warning, index) => (
          <p key={index} className="text-xs text-yellow-600">{warning}</p>
        ))}
      </div>
    );
  }

  if (compatibility.suggestions.length > 0) {
    return (
      <div className={`space-y-1 ${className}`}>
        <Badge variant="outline" className="flex items-center gap-1 border-blue-500 text-blue-700">
          <Info className="h-3 w-3" />
          Suggested
        </Badge>
        {compatibility.suggestions.map((suggestion, index) => (
          <p key={index} className="text-xs text-blue-600">{suggestion}</p>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-700">
        <CheckCircle className="h-3 w-3" />
        Compatible
      </Badge>
    </div>
  );
};

export default CompatibilityIndicator;
