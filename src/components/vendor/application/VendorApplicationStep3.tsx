
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, FileUp, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getDocumentRequirementsForServices } from './vendorTypeConfig';

interface VendorApplicationStep3Props {
  form: UseFormReturn<any>;
  populateDemoData?: () => void;
}

const VendorApplicationStep3: React.FC<VendorApplicationStep3Props> = ({ 
  form, 
  populateDemoData
}) => {
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const serviceTypes = form.watch('serviceTypes');
  
  // Get required documents based on selected service types
  const documentRequirements = getDocumentRequirementsForServices(serviceTypes);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue(fieldName, file);
      setFileNames(prev => ({ ...prev, [fieldName]: file.name }));
    }
  };

  if (!serviceTypes || serviceTypes.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Documentation</h2>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Service Selection Required</AlertTitle>
          <AlertDescription>
            Please select at least one marketplace service in Step 1 to see required documents.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Documentation</h2>
      <p className="text-gray-500">Upload required documents to verify your business</p>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          All documents must be current and valid. JPG, PNG, or PDF formats accepted.
        </AlertDescription>
      </Alert>
      
      {documentRequirements.length === 0 ? (
        <p className="text-sm text-muted-foreground">No document requirements for the selected services.</p>
      ) : (
        <div className="space-y-6">
          {documentRequirements.map((doc) => (
            <FormField
              key={doc.id}
              control={form.control}
              name={doc.id}
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>{doc.label}{doc.required ? " *" : " (Optional)"}</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        id={doc.id}
                        onChange={(e) => handleFileChange(e, doc.id)}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById(doc.id)?.click()}
                        className="flex-1 flex justify-between items-center"
                      >
                        <span>{fileNames[doc.id] || `Upload ${doc.label}`}</span>
                        <FileUp className="h-4 w-4" />
                      </Button>
                      {fileNames[doc.id] && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    {doc.description}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorApplicationStep3;
