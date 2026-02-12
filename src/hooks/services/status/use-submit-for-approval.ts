import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { ServiceStatus } from '@/types/service-types';

export const useSubmitForApproval = (updateService: (id: string, data: any) => Promise<any>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: submitService, isPending: isMutationLoading } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ServiceStatus }) => {
      setIsSubmitting(true);
      try {
        // Optimistically update the service status
        toast({
          title: "Submitting service...",
          description: "Please wait while we submit your service for approval.",
        });

        // Call the update service function
        await updateService(id, { status: status });

        // Show success message
        toast({
          title: "Success",
          description: "Service submitted for approval successfully.",
        });
      } catch (error: any) {
        // Show error message
        toast({
          title: "Error",
          description: error.message || "Failed to submit service for approval. Please try again.",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const validateService = (formData: any) => {
    let errors: string[] = [];

    if (!formData.name) {
      errors.push("Service name is required");
    }

    if (!formData.description) {
      errors.push("Service description is required");
    }

    if (!formData.price) {
      errors.push("Service price is required");
    }
    
    if (!formData.images || formData.images.length === 0) {
      errors.push("At least one image is required");
    }
    
    // Service type specific validations
    switch (formData.type) {
      case 'catering':
        // Catering specific validation
        if (!formData.cateringDetails?.serviceStyles || formData.cateringDetails.serviceStyles.length === 0) {
          errors.push("At least one catering service style must be selected");
        }
        break;
      case 'venues':
        // Venue specific validation
        if (!formData.venueDetails?.capacity?.seated) {
          errors.push("Venue capacity must be specified");
        }
        break;
      case 'party-rentals':
        // Party rental specific validation
        if (!formData.rentalDetails?.availableQuantity) {
          errors.push("Available quantity must be specified for rental items");
        }
        break;
      case 'staff':
        // Staff specific validation
        if (!formData.staffDetails?.qualifications || formData.staffDetails.qualifications.length === 0) {
          errors.push("At least one staff qualification must be specified");
        }
        break;
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      });
    }

    return errors;
  };

  const handleServiceSubmit = async (id: string, formData: any) => {
    const errors = validateService(formData);
    if (errors.length === 0) {
      await submitService({ id: id, status: 'pending_approval' });
    } else {
      console.error("Validation errors:", errors);
    }
  };

  return { submitService: handleServiceSubmit, isSubmitting: isSubmitting || isMutationLoading };
};
