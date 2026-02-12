
import React from 'react';

interface CategoryErrorProps {
  errors: any;
}

export const CategoryError: React.FC<CategoryErrorProps> = ({ errors }) => {
  if (!errors || !errors.comboCategories) return null;
  
  return (
    <p className="text-sm mt-2 text-destructive">
      {errors.comboCategories.message}
    </p>
  );
};
