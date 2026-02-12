
import React from 'react';

interface CategoryHeaderProps {
  title: string;
  description: string;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({ title, description }) => {
  return (
    <>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">
        {description}
      </p>
    </>
  );
};
