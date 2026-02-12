
import React from 'react';

interface VendorApplicationProgressProps {
  currentStep: number;
}

const VendorApplicationProgress: React.FC<VendorApplicationProgressProps> = ({ currentStep }) => {
  // Define steps for the vendor application process
  const steps = [
    { id: 1, name: "Basic Info" },
    { id: 2, name: "Business Details" },
    { id: 3, name: "Documents" },
    { id: 4, name: "Account Setup" }
  ];

  return (
    <div className="w-full pt-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
              ${currentStep === step.id 
                ? 'bg-[#F07712] text-white' 
                : currentStep > step.id 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-500'}`}
            >
              {currentStep > step.id ? '✓' : step.id}
            </div>
            <div className="text-xs text-gray-500 text-center">
              {step.name}
            </div>
          </div>
        ))}
      </div>
      
      <div className="relative mb-8">
        <div className="absolute h-1 w-full bg-gray-200 rounded">
          <div 
            className="h-1 bg-[#F07712] rounded transition-all"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default VendorApplicationProgress;
