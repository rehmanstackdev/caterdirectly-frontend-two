import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseImageUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  bucketName?: string;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    onSuccess,
    onError,
    maxFileSize = 5, // Default 5MB
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    bucketName = 'service-images'
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      const error = new Error(`File size exceeds maximum allowed size (${maxFileSize}MB)`);
      setError(error);
      if (onError) onError(error);
      
      toast({
        title: 'File too large',
        description: `Maximum file size is ${maxFileSize}MB`,
        variant: 'destructive'
      });
      
      return false;
    }

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      const error = new Error(`File type not supported. Accepted types: ${acceptedTypes.join(', ')}`);
      setError(error);
      if (onError) onError(error);
      
      toast({
        title: 'Unsupported file type',
        description: `Please upload one of these formats: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`,
        variant: 'destructive'
      });
      
      return false;
    }

    return true;
  }, [maxFileSize, acceptedTypes, onError]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    console.log('Starting image upload for file:', file.name);
    
    if (!validateFile(file)) {
      console.error('File validation failed');
      throw new Error('File validation failed');
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate upload progress
      setProgress(30);
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Create blob URL for local preview
      const blobUrl = URL.createObjectURL(file);
      
      setProgress(100);
      
      // Return the blob URL
      if (onSuccess) {
        onSuccess(blobUrl);
      }
      
      toast({
        title: 'Image uploaded successfully',
        description: 'Your image has been prepared for upload'
      });
      
      return blobUrl;
    } catch (err) {
      console.error('Error in uploadImage:', err);
      
      const error = err instanceof Error ? err : new Error('Failed to process image');
      setError(error);
      if (onError) {
        onError(error);
      }
      
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
      });
      
      throw error;
    } finally {
      // Reset after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 500);
    }
  }, [validateFile, onSuccess, onError]);

  return {
    uploadImage,
    isUploading,
    progress,
    error,
    validateFile
  };
}
