

import { ServiceSelection } from '@/types/order';
import EnhancedCateringFilters from './EnhancedCateringFilters';

interface CateringFiltersProps {
  existingServices?: ServiceSelection[];
  onFiltersChange?: (filters: any) => void;
}

const CateringFilters = ({ existingServices = [], onFiltersChange }: CateringFiltersProps) => {
  return <EnhancedCateringFilters existingServices={existingServices} onFiltersChange={onFiltersChange} />;
};

export default CateringFilters;
