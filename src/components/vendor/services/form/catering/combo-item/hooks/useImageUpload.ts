
import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ComboItemFormValues } from '../validation/form-schemas';
import { useImageUpload as useSupabaseImageUpload } from '@/hooks/services/use-image-upload';
import { SERVICE_IMAGES_BUCKET } from '@/utils/supabase-storage-utils';
import { toast } from '@/hooks/use-toast';
import { isValidImageUrl } from '@/hooks/events/utils/image';

export function useImageUpload(form: UseFormReturn<ComboItemFormValues>) {
  const [uploading, setUploading] = useState(false);
  const { setValue } = form;
  
  const { uploadImage, isUploading, progress } = useSupabaseImageUpload({
    bucketName: SERVICE_IMAGES_BUCKET,
    onSuccess: (url) => {
      handleFileUploadComplete(url);
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
  
  const handleFileUpload = useCallback((file: File) => {
    setUploading(true);
    console.log('[useImageUpload] Uploading compressed image file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    uploadImage(file).catch((error) => {
      console.error('[useImageUpload] Error uploading image:', error);
      setUploading(false);
    });
  }, [uploadImage]);
  
  const handleFileUploadComplete = (url: string) => {
    setUploading(false);
    // Validate URL
    if (isValidImageUrl(url)) {
      console.log(`[useImageUpload] Image uploaded successfully: ${url}`);
      setValue('image', url, { shouldValidate: true });
      
      toast({
        title: "Image uploaded",
        description: "Your combo item image has been uploaded successfully"
      });
    } else {
      console.error(`[useImageUpload] Uploaded image has invalid URL: ${url}`);
      toast({
        title: "Image processing issue",
        description: "The image was uploaded but the URL may not be valid",
        variant: "destructive"  // Changed from "warning" to "destructive"
      });
      // Still set the value as it might work
      setValue('image', url, { shouldValidate: true });
    }
  };
  
  return {
    uploading: uploading || isUploading,
    progress,
    handleFileUpload,
    handleFileUploadComplete
  };
}
