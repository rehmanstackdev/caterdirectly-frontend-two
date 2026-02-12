
import React from 'react';
import { Tag } from 'lucide-react';

interface ItemFlagsProps {
  dietaryFlags?: string[];
  allergenFlags?: string[];
}

const ItemFlags: React.FC<ItemFlagsProps> = ({ dietaryFlags, allergenFlags }) => {
  if (!dietaryFlags?.length && !allergenFlags?.length) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {dietaryFlags && dietaryFlags.map(flag => (
        <span key={flag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          <Tag className="h-3 w-3 mr-1" />
          {flag.replace('_', ' ')}
        </span>
      ))}
      {allergenFlags && allergenFlags.map(flag => (
        <span key={flag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
          <Tag className="h-3 w-3 mr-1" />
          {flag.replace('_', ' ')}
        </span>
      ))}
    </div>
  );
};

export default ItemFlags;
