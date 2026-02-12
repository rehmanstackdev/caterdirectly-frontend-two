
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

interface VendorApplicationNavigationProps {
  currentStep: number;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const VendorApplicationNavigation: React.FC<VendorApplicationNavigationProps> = ({ 
  currentStep, 
  isSubmitting, 
  onPrevious, 
  onNext
}) => {
  const navigate = useNavigate();

  return (
    <>
      <Separator className="my-6" />
      
      <div className="flex justify-between pt-4">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
          >
            Previous Step
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
        )}
        
        {currentStep < 4 ? (
          <Button 
            type="button" 
            onClick={onNext}
            className="bg-[#F07712] hover:bg-[#F07712]/90"
          >
            Continue to Next Step
          </Button>
        ) : (
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#F07712] hover:bg-[#F07712]/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        )}
      </div>
    </>
  );
};

export default VendorApplicationNavigation;
