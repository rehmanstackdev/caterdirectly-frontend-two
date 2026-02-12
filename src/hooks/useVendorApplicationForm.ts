import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getDocumentRequirementsForServices } from '@/components/vendor/application/vendorTypeConfig';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import vendorsService from '@/services/api/admin/vendors.Service';
import { useAuth } from '@/contexts/auth';

const VENDOR_APP_DRAFT_KEY = 'vendor_application_draft_v1';

export const useVendorApplicationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [dynamicSchema, setDynamicSchema] = useState<z.ZodType<any>>(z.object({}));

  // Create dynamic schema based on service types
  const createApplicationSchema = (serviceTypes?: string[]) => {
    // Base schema for all vendors
    const baseSchema = z.object({
      // Step 1: Basic Information
      businessName: z.string().min(2, 'Business name must be at least 2 characters'),
      contactFirstName: z.string().min(2, 'First name must be at least 2 characters'),
      contactLastName: z.string().min(2, 'Last name must be at least 2 characters'),
      serviceTypes: z.array(z.enum(['catering', 'venues', 'party-rentals', 'staff'])).min(1, 'Please select at least one marketplace service'),
      email: z.string().email('Please enter a valid email'),
      phone: z.string().min(10, 'Please enter a valid phone number'),
      website: z.string()
        .refine(
          (val) => !val || /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/.*)?$/.test(val),
          'Please enter a valid URL'
        )
        .optional()
        .or(z.literal('')),
      
      // Step 2: Business Details
      einTin: z.string().min(9, 'Please enter a valid EIN/TIN'),
      fullAddress: z.string().min(5, 'Please enter a complete address'),
      address: z.string().min(1, 'Address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      zipCode: z.string().min(1, 'ZIP code is required').optional().or(z.literal('')),
      coordinatesLat: z.number().optional(),
      coordinatesLng: z.number().optional(),
      
      // Certifications - make it more flexible
      certifications: z.any().optional(),
      
      // Step 4: Account Setup
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
      termsAccepted: z.boolean({
        required_error: "You must accept the Terms of Service",
      }).refine(val => val === true, {
        message: "You must accept the Terms of Service",
      }),
    });
    
    // Add document validation based on selected service types
    if (serviceTypes && serviceTypes.length > 0) {
      const documentRequirements = getDocumentRequirementsForServices(serviceTypes);
      const documentSchema: Record<string, z.ZodType<any>> = {};
      
      // Create schema entries for each required document
      documentRequirements.forEach(doc => {
        if (doc.required) {
          documentSchema[doc.id] = z.any().refine(val => val !== undefined && val !== null, {
            message: `${doc.label} is required`
          });
        } else {
          documentSchema[doc.id] = z.any().optional();
        }
      });
      
      // Merge with base schema
      return baseSchema.extend(documentSchema);
    }
    
    // Default schema with optional documents
    return baseSchema.extend({
      businessLicense: z.any(),
      healthPermit: z.any(),
      liabilityInsurance: z.any(),
      foodHandlerCertification: z.any().optional(),
    });
  };

  const form = useForm<z.infer<typeof dynamicSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      businessName: '',
      contactFirstName: '',
      contactLastName: '',
      serviceTypes: [],
      email: '',
      phone: '',
      website: '',
      einTin: '',
      fullAddress: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      coordinatesLat: undefined,
      coordinatesLng: undefined,
      certifications: {
        insurance_policies: [],
        licenses: [],
        service_area_certifications: []
      },
      termsAccepted: false,
    },
    mode: 'onChange',
  });

  // Watch for service types changes to update schema
  const serviceTypes = form.watch('serviceTypes');
  
  useEffect(() => {
    const newSchema = createApplicationSchema(serviceTypes);
    setDynamicSchema(newSchema.refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }));
  }, [serviceTypes]);

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return ['businessName', 'contactFirstName', 'contactLastName', 'serviceTypes', 'email', 'phone', 'website'] as const;
      case 2:
        return ['einTin', 'fullAddress', 'address', 'city', 'state', 'zipCode', 'certifications'] as const;
      case 3:
        // Dynamic document fields based on selected service types
        if (serviceTypes && serviceTypes.length > 0) {
          return getDocumentRequirementsForServices(serviceTypes).map(doc => doc.id) as any;
        }
        return ['businessLicense', 'liabilityInsurance'] as const;
      case 4:
        return ['password', 'confirmPassword', 'termsAccepted'] as const;
      default:
        return [] as const;
    }
  };

  const nextStep = async () => {
    const fields = getFieldsForStep(currentStep);
    console.log(`Step ${currentStep} - Validating fields:`, fields);
    
    const isValid = await form.trigger(fields);
    console.log(`Step ${currentStep} - Validation result:`, isValid);
    
    if (!isValid) {
      const errors = form.formState.errors;
      console.log(`Step ${currentStep} - Validation errors:`, errors);
    }
    
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const previousStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  // Function to populate form with demo data for each step
  const populateDemoData = (step: number) => {
    switch (step) {
      case 1:
        form.setValue('businessName', 'Demo Catering Co.');
        form.setValue('contactFirstName', 'John');
        form.setValue('contactLastName', 'Smith');
        form.setValue('serviceTypes', ['catering', 'staff']);
        form.setValue('email', 'demo@cateringco.com');
        form.setValue('phone', '1234567890');
        form.setValue('website', 'https://democatering.com');
        break;
      case 2:
        form.setValue('einTin', '12-3456789');
        form.setValue('fullAddress', '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA');
        form.setValue('address', '1600 Amphitheatre Parkway');
        form.setValue('city', 'Mountain View');
        form.setValue('state', 'CA');
        form.setValue('zipCode', '94043');
        form.setValue('coordinatesLat', 37.4224764);
        form.setValue('coordinatesLng', -122.0842499);
        break;
      case 3:
        // Get dynamic document requirements and populate demo files
        const currentServiceTypes = form.watch('serviceTypes');
        const documentRequirements = getDocumentRequirementsForServices(currentServiceTypes);
        const demoFile = {name: 'demo-document.pdf', size: 1024 * 1024, type: 'application/pdf'};
        
        documentRequirements.forEach(doc => {
          form.setValue(doc.id as any, demoFile);
        });
        break;
      case 4:
        form.setValue('password', 'demo12345');
        form.setValue('confirmPassword', 'demo12345');
        form.setValue('termsAccepted', true);
        break;
      default:
        break;
    }
  };

  // Draft persistence helpers (never store passwords or files)
  const sanitizeDraft = (d: any) => ({
    businessName: d.businessName,
    contactFirstName: d.contactFirstName,
    contactLastName: d.contactLastName,
    serviceTypes: d.serviceTypes,
    email: d.email,
    phone: d.phone,
    website: d.website,
    einTin: d.einTin,
    fullAddress: d.fullAddress,
    address: d.address,
    city: d.city,
    state: d.state,
    zipCode: d.zipCode,
    coordinatesLat: d.coordinatesLat,
    coordinatesLng: d.coordinatesLng,
    certifications: d.certifications || {
      insurance_policies: [],
      licenses: [],
      service_area_certifications: []
    }
  });

  const saveDraft = (d: any) => {
    try { localStorage.setItem(VENDOR_APP_DRAFT_KEY, JSON.stringify(sanitizeDraft(d))); } catch {}
  };
  const loadDraft = (): any | null => {
    try { const j = localStorage.getItem(VENDOR_APP_DRAFT_KEY); return j ? JSON.parse(j) : null; } catch { return null; }
  };
  const clearDraft = () => { try { localStorage.removeItem(VENDOR_APP_DRAFT_KEY); } catch {} };

  const submitApplication = async (data: z.infer<typeof dynamicSchema>) => {
    setIsSubmitting(true);

    try {
      console.log('=== VENDOR APPLICATION SUBMITTED ===');
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add basic fields
      formData.append('firstName', data.contactFirstName);
      formData.append('lastName', data.contactLastName);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('role', 'vendor');
      formData.append('businessName', data.businessName);
      formData.append('phone', data.phone);
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('state', data.state);
      formData.append('zipCode', data.zipCode);
      formData.append('fullAddress', data.fullAddress);
      formData.append('einTin', data.einTin);
      formData.append('serviceTypes', JSON.stringify(data.serviceTypes));
      formData.append('termsAccepted', data.termsAccepted.toString());
      
      if (data.website) {
        formData.append('website', data.website);
      }
      
      if (data.coordinatesLat && data.coordinatesLng) {
        formData.append('coordinates', JSON.stringify({
          lat: data.coordinatesLat,
          lng: data.coordinatesLng
        }));
      }
      
      if (data.certifications) {
        // Send as arrays directly (your DTO handles JSON parsing)
        if (data.certifications.licenses?.length) {
          formData.append('licenses', JSON.stringify(data.certifications.licenses));
        }
        if (data.certifications.insurance_policies?.length) {
          formData.append('insurance_policies', JSON.stringify(data.certifications.insurance_policies));
        }
        if (data.certifications.service_area_certifications?.length) {
          formData.append('service_area_certifications', JSON.stringify(data.certifications.service_area_certifications));
        }
      }
      
      // Add document files
      const documentFields = ['businessLicense', 'healthPermit', 'liabilityInsurance', 'foodHandlerCertification'];
      documentFields.forEach(field => {
        if (data[field] && data[field] instanceof File) {
          formData.append(field, data[field]);
        }
      });
      
      // Check if this is coming from admin dashboard
      const searchParams = new URLSearchParams(window.location.search);
      const isAdminCreate = searchParams.get('adminCreate') === 'true';
      
      console.log('Submitting vendor registration...', isAdminCreate ? 'via admin' : 'via public registration');
      console.log('Registration data being sent:', {
        firstName: data.contactFirstName,
        lastName: data.contactLastName,
        email: data.email,
        role: 'vendor',
        businessName: data.businessName
      });
      
      const responseData = isAdminCreate 
        ? await vendorsService.createVerifiedVendor(formData)
        : await vendorsService.registerVendor(formData);
      
      console.log('Registration response:', responseData);
      
      clearDraft();
      
      if (isAdminCreate) {
        // For admin-created vendors, navigate immediately without showing success page
        toast.success("Vendor Created", {
          description: responseData.message || 'Vendor account has been created successfully.',
        });
        navigate('/admin/vendors');
      } else {
        // For public registration, navigate directly to login without showing success page
        localStorage.setItem('pending_verification_role', 'vendor');
        toast.success("Application Submitted", {
          description: responseData.message || 'Your vendor application has been received. Please check your email to verify your account.',
        });
        navigate('/vendor/login');
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'There was a problem submitting your application. Please try again.';
      toast.error("Application Failed", {
        description: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    currentStep,
    setCurrentStep,
    isSubmitting,
    applicationSubmitted,
    serviceTypes,
    nextStep,
    previousStep,
    submitApplication,
    populateDemoData
  };
};