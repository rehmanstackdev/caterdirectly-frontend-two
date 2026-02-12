
import React from 'react';

const BadgeBenefits: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 rounded-lg text-center">
      <h3 className="font-medium text-lg mb-2">Benefits of Premier Provider Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        <div className="p-3 bg-white rounded-lg border">
          <p className="font-medium">Reduced Commission</p>
          <p className="text-sm text-gray-500">Pay only 12% instead of 15%</p>
        </div>
        <div className="p-3 bg-white rounded-lg border">
          <p className="font-medium">Featured Placement</p>
          <p className="text-sm text-gray-500">Top spot in search results</p>
        </div>
        <div className="p-3 bg-white rounded-lg border">
          <p className="font-medium">Premium Badge</p>
          <p className="text-sm text-gray-500">Displayed on your listings</p>
        </div>
      </div>
    </div>
  );
};

export default BadgeBenefits;
