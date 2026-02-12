
import React, { useState, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '@/components/shared/FileUpload';

import ServiceImage from '@/components/shared/ServiceImage';

interface ServiceMediaProps {
  formData: {
    images: string[];
    coverImage?: string;
  };
  updateFormData: (data: Partial<ServiceMediaProps['formData']>) => void;
  showErrors?: boolean;
  minImages?: number;
  maxImages?: number;
  serviceType?: string;
}

const ServiceMedia: React.FC<ServiceMediaProps> = ({
  formData,
  updateFormData,
  showErrors = false,
  minImages = 1,
  maxImages,
  serviceType,
}) => {
  const [uploading, setUploading] = useState(false);
  
  const [progress, setProgress] = useState(0);
  const isUploading = false; // Disable Supabase upload
  
  const handleFileUpload = useCallback((file: File) => {
    if (maxImages && formData.images.length >= maxImages) {
      const normalizedServiceType = serviceType?.replace('-', '_');
      if (normalizedServiceType === 'party_rentals' || normalizedServiceType === 'events_staff' || normalizedServiceType === 'staff') {
        const label = normalizedServiceType === 'party_rentals' ? 'Party rental' : 'Event staff';
        toast.error(`${label} services allow only 1 image. Current: ${formData.images.length}.`);
      } else {
        toast.error(`You can only upload up to ${maxImages} images. Current: ${formData.images.length}.`);
      }
      return;
    }
    setUploading(true);
    
    // Create immediate preview
    const previewUrl = URL.createObjectURL(file);
    const newImages = [...formData.images, previewUrl];
    updateFormData({ images: newImages });
    
    // Set as cover image if first image
    if (!formData.coverImage && newImages.length === 1) {
      updateFormData({ coverImage: previewUrl });
    }
    
    // For now, just keep the preview URL (no backend upload)
    setUploading(false);
    toast.success("Image added to service");
  }, [formData.images, formData.coverImage, updateFormData, maxImages]);
  
  const handleFileUploadComplete = useCallback((url: string) => {
    // This function is no longer used since we're not uploading to Supabase
    console.log('File upload complete callback (unused)');
  }, []);
  
  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    const removedImage = newImages[index];
    newImages.splice(index, 1);
    updateFormData({ images: newImages });
    
    // Update cover image if the removed image was the cover
    if (formData.coverImage === removedImage && newImages.length > 0) {
      updateFormData({ coverImage: newImages[0] });
    } else if (newImages.length === 0) {
      updateFormData({ coverImage: undefined });
    }
  };
  
  const setCoverImage = (image: string) => {
    updateFormData({ coverImage: image });
    
    toast.success("This image will be used as the main image for your service");
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Service Images</Label>
          {maxImages && (
            <span className="text-xs text-gray-500">{formData.images.length}/{maxImages}</span>
          )}
          {showErrors && (!formData.images || formData.images.length < minImages) && (
            <span className="text-sm text-destructive">Required</span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Add images that showcase your service. The first image will be used as the cover image.
          {maxImages ? ` (Minimum ${minImages}, maximum ${maxImages})` : ''}
        </p>
      </div>
      
      <div className="space-y-4">
        <FileUpload
          onFileUpload={handleFileUpload}
          onFileUploadComplete={handleFileUploadComplete}
          uploading={uploading || isUploading}
          compressionType="service"
          showCompressionInfo={true}
        />
        
        {(uploading || isUploading) && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-[#F07712] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
            <p className="text-xs text-center mt-1 text-gray-500">Uploading: {Math.round(progress)}%</p>
          </div>
        )}
        
        {formData.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group aspect-square bg-gray-50 rounded-md">
                <ServiceImage 
                  src={image}
                  alt={`Service image ${index + 1}`}
                  className={`w-full h-full rounded-md ${
                    formData.coverImage === image ? 'ring-2 ring-[hsl(var(--primary))]' : ''
                  }`}
                  aspectRatio="aspect-square"
                  objectFit="contain"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button 
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {formData.coverImage !== image && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setCoverImage(image)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Set as Cover
                  </Button>
                )}
                {formData.coverImage === image && (
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Cover Image
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border-2 border-dashed rounded-md">
            <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No images added yet</p>
            <p className="text-xs text-gray-400">Add images to showcase your service</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceMedia;
