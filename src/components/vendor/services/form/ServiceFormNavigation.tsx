
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Save, ArrowLeft, ArrowRight } from 'lucide-react';

interface ServiceFormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onSubmitForApproval: () => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
  adminContext?: boolean;
  progress?: number; // Added progress prop
}

const ServiceFormNavigation: React.FC<ServiceFormNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveDraft,
  onSubmitForApproval,
  isSubmitting,
  isEditMode = false,
  adminContext = false,
  progress = 0 // Default progress
}) => {
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;
  
  // Calculate progress percentage if not provided
  const calculatedProgress = progress > 0 ? progress : (currentStep / totalSteps) * 100;
  
  // Get button text based on context
  const getSubmitButtonText = () => {
    if (isSubmitting) return 'Submitting...';
    
    if (isEditMode) {
      return 'Update & Submit';
    } else if (adminContext) {
      return 'Create Service';
    } else {
      return 'Submit for Approval';
    }
  };

  return (
    <>
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-[#F07712] h-2.5 rounded-full" 
          style={{ width: `${calculatedProgress}%` }}
        ></div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.floor(calculatedProgress)}% Complete</span>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="flex justify-between">
        <div>
          {!isFirstStep ? (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Step
            </Button>
          ) : null}
        </div>
        
        <div className="flex gap-2">
          {/* <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isEditMode ? 'Save Changes' : 'Save Draft'}
          </Button> */}
          
          {!isLastStep ? (
            <Button 
              type="button" 
              onClick={onNext}
              className="bg-[#F07712] hover:bg-[#F07712]/90"
              disabled={isSubmitting}
            >
              Continue to Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={onSubmitForApproval}
              className="bg-[#F07712] hover:bg-[#F07712]/90"
              disabled={isSubmitting}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {getSubmitButtonText()}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default ServiceFormNavigation;
