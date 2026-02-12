
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X, DollarSign, Image as ImageIcon } from 'lucide-react';
import type { ComboItem } from '@/types/service-types';
import { useImageUpload } from '@/hooks/services/use-image-upload';
import { toast } from '@/hooks/use-toast';
import { MENU_IMAGES_BUCKET } from '@/utils/supabase-storage-utils';

interface ComboItemEditorProps {
  item: ComboItem;
  categoryId: string;
  onUpdateItem: (categoryId: string, itemId: string, field: keyof ComboItem, value: any) => void;
  onRemoveItem: (categoryId: string, itemId: string) => void;
}

const ComboItemEditor: React.FC<ComboItemEditorProps> = ({
  item,
  categoryId,
  onUpdateItem,
  onRemoveItem
}) => {
  const [uploading, setUploading] = React.useState(false);
  
  const { uploadImage, isUploading, progress } = useImageUpload({
    bucketName: MENU_IMAGES_BUCKET,
    onSuccess: (url) => {
      onUpdateItem(categoryId, item.id, 'image', url);
      setUploading(false);
      toast({
        title: "Image uploaded",
        description: "Image has been added to this combo item"
      });
    },
    onError: (error) => {
      console.error(`[ComboItemEditor] Image upload failed for item ${item.id}:`, error);
      setUploading(false);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleFileUpload = (file: File) => {
    setUploading(true);
    uploadImage(file).catch((error) => {
      console.error(`[ComboItemEditor] Error uploading image:`, error);
      setUploading(false);
    });
  };

  return (
    <div className="bg-gray-50 p-3 rounded flex flex-col gap-2">
      <div className="flex justify-between">
        <Input
          value={item.name}
          onChange={(e) => onUpdateItem(categoryId, item.id, 'name', e.target.value)}
          placeholder="Item name"
          className="flex-1 mr-2"
        />
        <Button 
          type="button" 
          variant="destructive" 
          size="sm" 
          onClick={() => onRemoveItem(categoryId, item.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Textarea
        value={item.description || ''}
        onChange={(e) => onUpdateItem(categoryId, item.id, 'description', e.target.value)}
        placeholder="Item description (optional)"
        rows={1}
      />
      
      <div className="border rounded p-2 bg-white">
        <Label htmlFor={`image-${item.id}`} className="block text-xs mb-1">Item Image</Label>
        {item.image ? (
          <div className="relative">
            <img 
              src={item.image} 
              alt={item.name || 'Combo item'} 
              className="w-full h-32 object-cover rounded" 
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute top-1 right-1 h-6 w-6 p-0"
              onClick={() => onUpdateItem(categoryId, item.id, 'image', undefined)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div 
            className="border-2 border-dashed border-gray-200 rounded flex items-center justify-center h-32 cursor-pointer hover:bg-gray-50"
            onClick={() => document.getElementById(`file-upload-${item.id}`)?.click()}
          >
            <div className="text-center">
              <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
              <span className="text-xs text-gray-500">Click to upload</span>
              <input
                id={`file-upload-${item.id}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              {(uploading || isUploading) && (
                <div className="w-full mt-2">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-10 justify-left">
        <div className="flex items-center">
          <Label htmlFor={`price-${item.id}`} className="mr-2 text-sm">Price:</Label>
          <div className="relative w-20">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
              <DollarSign className="h-3 w-3" />
            </span>
            <Input
              id={`price-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              value={item.price || 0}
              onChange={(e) => onUpdateItem(
                categoryId, 
                item.id, 
                'price', 
                parseFloat(e.target.value) || 0
              )}
              className="pl-6"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <Label htmlFor={`quantity-${item.id}`} className="mr-2 text-sm">Quantity:</Label>
          <Input
            id={`quantity-${item.id}`}
            type="number"
            min="0"
            step="1"
            value={item.quantity || 0}
            onChange={(e) => onUpdateItem(
              categoryId, 
              item.id, 
              'quantity', 
              parseInt(e.target.value) || 0
            )}
            className="w-16"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Checkbox
          id={`premium-${item.id}`}
          checked={item.isPremium || false}
          onCheckedChange={(checked) => {
            console.log(`[ComboItemEditor] isPremium changed to:`, checked, 'type:', typeof checked);
            onUpdateItem(categoryId, item.id, 'isPremium', checked);
          }}
        />
        <Label htmlFor={`premium-${item.id}`} className="text-sm cursor-pointer">Premium Item</Label>
      </div>
      
      {item.isPremium && (
        <div className="flex items-center">
          <Label htmlFor={`additionalCharge-${item.id}`} className="mr-2 text-sm">Additional Charge:</Label>
          <div className="relative w-24">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
              <DollarSign className="h-3 w-3" />
            </span>
            <Input
              id={`additionalCharge-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              value={item.additionalCharge || 0}
              onChange={(e) => onUpdateItem(
                categoryId,
                item.id,
                'additionalCharge',
                parseFloat(e.target.value) || 0
              )}
              className="pl-6"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboItemEditor;
