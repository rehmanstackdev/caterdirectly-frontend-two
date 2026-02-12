
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import VendorApplicationStep1 from '@/components/vendor/application/VendorApplicationStep1';
import VendorApplicationStep2 from '@/components/vendor/application/VendorApplicationStep2';
import VendorApplicationStep3 from '@/components/vendor/application/VendorApplicationStep3';
import VendorApplicationStep4 from '@/components/vendor/application/VendorApplicationStep4';
import VendorApplicationSuccess from '@/components/vendor/application/VendorApplicationSuccess';
import VendorApplicationProgress from '@/components/vendor/application/VendorApplicationProgress';
import VendorApplicationNavigation from '@/components/vendor/application/VendorApplicationNavigation';
import { useVendorApplicationForm } from '@/hooks/useVendorApplicationForm';

import { AlertCircle } from 'lucide-react';

const VendorApplication = () => {
  const navigate = useNavigate();
  
  const {
    form,
    currentStep,
    setCurrentStep,
    isSubmitting,
    applicationSubmitted,
    nextStep,
    previousStep,
    submitApplication,
    populateDemoData
  } = useVendorApplicationForm();


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header hideNavigation={true} variant="light" />
      
      <div className="flex-1 container mx-auto px-4 py-10">
        {applicationSubmitted ? (
          <VendorApplicationSuccess />
        ) : (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-center">Vendor Application</CardTitle>
              <CardDescription className="text-center">
                Join our marketplace as a verified vendor
              </CardDescription>
              
              <VendorApplicationProgress currentStep={currentStep} />
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(submitApplication)} className="space-y-6">
                  {currentStep === 1 && (
                    <VendorApplicationStep1 
                      form={form} 
                      populateDemoData={() => populateDemoData(1)}
                    />
                  )}
                  
                  {currentStep === 2 && (
                    <VendorApplicationStep2 
                      form={form} 
                      populateDemoData={() => populateDemoData(2)}
                    />
                  )}
                  
                  {currentStep === 3 && (
                    <VendorApplicationStep3 
                      form={form} 
                      populateDemoData={() => populateDemoData(3)}
                    />
                  )}
                  
                  {currentStep === 4 && (
                    <VendorApplicationStep4 
                      form={form}
                      populateDemoData={() => populateDemoData(4)}
                    />
                  )}
                  
                  <VendorApplicationNavigation 
                    currentStep={currentStep}
                    isSubmitting={isSubmitting}
                    onPrevious={previousStep}
                    onNext={nextStep}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default VendorApplication;
