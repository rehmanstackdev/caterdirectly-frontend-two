
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { MenuItemFormValues } from '../validation/form-schemas';
import FileUpload from '@/components/shared/FileUpload';
import ServiceImage from '@/components/shared/ServiceImage';
import { useImageUpload as useSupabaseImageUpload } from '@/hooks/services/use-image-upload';
import { SERVICE_IMAGES_BUCKET } from '@/utils/supabase-storage-utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MenuItemImageProps {
  form: UseFormReturn<MenuItemFormValues>;
}

export const MenuItemImage: React.FC<MenuItemImageProps> = ({
  form
}) => {
  const [uploading, setUploading] = useState(false);
  const imageValue = form.watch('image');
  
  const { uploadImage, isUploading, progress } = useSupabaseImageUpload({
    bucketName: SERVICE_IMAGES_BUCKET,
    onSuccess: (url) => {
      handleImageComplete(url);
    },
    onError: (error) => {
      setUploading(false);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleImageUpload = (file: File) => {
    setUploading(true);
    uploadImage(file).catch(() => {
      setUploading(false);
    });
  };
  
  const handleImageComplete = (url: string) => {
    setUploading(false);
    form.setValue('image', url, { shouldValidate: true });
  };
  
  const handleRemoveImage = () => {
    form.setValue('image', undefined);
  };

  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Item Image (Optional)</FormLabel>
          <FormControl>
            <div className="space-y-2">
              {imageValue ? (
                <div className="relative border rounded-md overflow-hidden">
                  <ServiceImage 
                    src={imageValue}
                    alt={form.watch('name') || "Menu item"}
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
                  onFileUpload={handleImageUpload}
                  onFileUploadComplete={handleImageComplete}
                  uploading={uploading || isUploading}
                  maxSize={5}
                  acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
                />
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
