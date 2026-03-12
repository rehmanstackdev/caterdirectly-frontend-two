
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useServiceForm } from '@/hooks/vendor/use-service-form';
import { useServiceSubmission } from '@/hooks/vendor/use-service-submission';
import { validateCurrentStep } from '@/utils/vendor/service-form-validation';
import { getTotalSteps } from '@/utils/vendor/service-form-steps';
import { toast } from '@/hooks/use-toast';
import { useServices } from '@/hooks/use-services';
import { useServiceEditLoader } from '@/hooks/vendor/use-service-edit-loader';
import { usersService } from '@/services/users.service';
import { useVendorData } from '@/hooks/vendor/use-vendor-data';

// Component imports
import ServiceFormStepRenderer from './ServiceFormStepRenderer';
import ServiceFormNavigation from './ServiceFormNavigation';
import ServiceFormHeader from './ServiceFormHeader';
import ServiceFormLoading from './ServiceFormLoading';

interface ServiceFormContainerProps {
  serviceId?: string;
  mode?: 'create' | 'edit';
  adminContext?: boolean;
  vendorId?: string;
  initialBrandId?: string;
}

const ServiceFormContainer: React.FC<ServiceFormContainerProps> = ({ 
  serviceId,
  mode = 'create',
  adminContext = false,
  vendorId = null,
  initialBrandId
}) => {
  // Service form state management
  const {
    formData,
    updateFormData,
    currentStep,
    vendorInfo,
    setVendorInfo,
    setIsInitialized,
    handleNextStep,
    handlePreviousStep
  } = useServiceForm();

  const { vendorData } = useVendorData();
  const [showStepErrors, setShowStepErrors] = React.useState(false);
  const [isLoadingVendor, setIsLoadingVendor] = React.useState(false);

  // Form submission handlers
  const {
    isSubmitting,
    handleSaveDraft,
    handleSubmitForApproval
  } = useServiceSubmission();
  
  // Set vendor info from vendorId prop (admin context) or localStorage (vendor context)
  useEffect(() => {
    if (adminContext && vendorId) {
      // Admin context: load vendor by ID
      if (vendorInfo.vendorId !== vendorId) {
        setIsLoadingVendor(true);
        const fetchVendor = async () => {
          try {
            const vendor = await usersService.getVendorById(vendorId);
            if (vendor?.businessName) {
              setVendorInfo({
                vendorId: vendorId,
                vendorName: vendor.businessName
              });
              setIsInitialized(true);
              sessionStorage.setItem('selected_vendor_id', vendorId);
              sessionStorage.setItem('selected_vendor_name', vendor.businessName);
            }
          } catch (error) {
            console.error("Error loading vendor:", error);
          } finally {
            setIsLoadingVendor(false);
          }
        };
        fetchVendor();
      }
    } else if (!adminContext && !vendorInfo.vendorId && vendorData) {
      // Vendor context: load from useVendorData hook (works for both owners and team members)
      setVendorInfo({
        vendorId: vendorData.id,
        vendorName: vendorData.businessName || 'Vendor'
      });
      setIsInitialized(true);
    }
  }, [adminContext, vendorId, vendorInfo.vendorId, vendorData, setVendorInfo, setIsInitialized]);
  
  // Use the extracted service edit loader logic for edit mode
  useServiceEditLoader(
    mode, 
    serviceId, 
    updateFormData, 
    setVendorInfo, 
    setIsInitialized
  );

  // Initialize brandId from prop for ghost brand service creation
  useEffect(() => {
    if (initialBrandId && mode === 'create' && !formData.brandId) {
      updateFormData({ brandId: initialBrandId });
    }
  }, [initialBrandId, mode, formData.brandId, updateFormData]);
  
  // Calculate the total number of steps based on service type
  const totalSteps = getTotalSteps(formData.type);

  // Handle the next button click with validation
  const handleNext = () => {
    const isValid = validateCurrentStep(formData, currentStep);
    if (isValid && currentStep < totalSteps) {
      setShowStepErrors(false);
      handleNextStep();
    } else if (!isValid) {
      setShowStepErrors(true);
      toast({
        title: "Validation Error",
        description: "Please complete all required fields",
        variant: "destructive"
      });
    }
  };

  // Show loading state while loading vendor
  if (isLoadingVendor) {
    return <ServiceFormLoading />;
  }

  return (
    <Card>
      <CardHeader>
        <ServiceFormHeader 
          mode={mode}
          currentStep={currentStep}
          totalSteps={totalSteps}
          serviceType={formData.type}
          adminContext={adminContext}
          vendorInfo={vendorInfo}
        />
      </CardHeader>
      <CardContent>
        <ServiceFormStepRenderer 
          currentStep={currentStep} 
          formData={formData} 
          updateFormData={updateFormData} 
          handleSubmitForApproval={handleSubmitForApproval}
          vendorInfo={vendorInfo}
          adminContext={adminContext}
          showErrors={showStepErrors}
        />
        
        <ServiceFormNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrevious={handlePreviousStep}
          onNext={handleNext}
          onSaveDraft={() => handleSaveDraft(formData, vendorInfo, adminContext)}
          onSubmitForApproval={() => handleSubmitForApproval(formData, vendorInfo, adminContext, mode === 'edit')}
          isSubmitting={isSubmitting}
          isEditMode={mode === 'edit'}
          adminContext={adminContext}
        />
      </CardContent>
    </Card>
  );
};

export default ServiceFormContainer;
