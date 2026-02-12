
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MenuItem } from '@/types/service-types';
import FileUpload from '@/components/shared/FileUpload';
import ServiceImage from '@/components/shared/ServiceImage';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ComboBasicInfoProps {
  name: string;
  description: string;
  image?: string;
  uploading: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFileUpload: (file: File) => void;
  onFileUploadComplete: (url: string) => void;
  onImageRemove: () => void;
}

const ComboBasicInfo: React.FC<ComboBasicInfoProps> = ({
  name,
  description,
  image,
  uploading,
  onNameChange,
  onDescriptionChange,
  onFileUpload,
  onFileUploadComplete,
  onImageRemove
}) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">Combo Name*</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          placeholder="e.g., Taco Bar Combo"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description || ''}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe your combo offer"
          className="mt-1"
          rows={2}
        />
      </div>
      
      {/* Image Upload */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Combo Image
          <span className="text-xs text-gray-500 font-normal">(Optional)</span>
        </Label>
        {image ? (
          <div className="relative border rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-video w-full max-h-48">
              <ServiceImage 
                src={image}
                alt={name}
                className="w-full h-full object-cover"
                aspectRatio="aspect-video"
              />
            </div>
            <Button 
              size="sm"
              variant="destructive" 
              className="absolute top-2 right-2"
              onClick={onImageRemove}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg shadow-sm overflow-hidden">
            <FileUpload
              onFileUpload={onFileUpload}
              onFileUploadComplete={onFileUploadComplete}
              uploading={uploading}
              className="aspect-video max-h-48"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboBasicInfo;
