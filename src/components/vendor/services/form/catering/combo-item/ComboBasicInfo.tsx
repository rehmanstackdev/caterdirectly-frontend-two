
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ComboItemFormValues } from './validation/form-schemas';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ServiceImage from '@/components/shared/ServiceImage';
import FileUpload from '@/components/shared/FileUpload';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ComboBasicInfoProps {
  form: UseFormReturn<ComboItemFormValues>;
  handleImageUpload?: (file: File) => void;
  uploadedImage?: string;
  uploading?: boolean;
}

const ComboBasicInfo: React.FC<ComboBasicInfoProps> = ({ form, handleImageUpload, uploadedImage, uploading = false }) => {
  const onFileUpload = (file: File) => {
    if (handleImageUpload) {
      handleImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    form.setValue('image', undefined);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Combo Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter combo name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe this combo" 
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormLabel>Combo Image</FormLabel>
          {uploadedImage ? (
            <div className="relative border rounded-md overflow-hidden">
              <ServiceImage 
                src={uploadedImage}
                alt="Combo Image"
                className="w-full h-40 object-cover"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={handleRemoveImage}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <FileUpload
              onFileUpload={onFileUpload}
              uploading={uploading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComboBasicInfo;
