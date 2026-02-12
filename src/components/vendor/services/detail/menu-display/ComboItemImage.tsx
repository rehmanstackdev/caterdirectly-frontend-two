
import React, { useState, useEffect } from 'react';
import ServiceImage from '@/components/shared/ServiceImage';
import { ImageIcon } from 'lucide-react';
import { ComboItem } from '@/types/service-types';
import { isValidImageUrl, resolveSupabaseUrl, resolvePublicUrl } from '@/hooks/events/utils/image';
import { extractImageUrl, ensureStringId } from '@/utils/data-transform';

interface ComboItemImageProps {
  comboItem: ComboItem;
  index: number;
}


const ComboItemImage: React.FC<ComboItemImageProps> = ({ comboItem, index }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Reset state
    setHasError(false);
    
    // Check for imageUrl field first (direct access)
    let extractedUrl = comboItem.imageUrl || comboItem.image_url || '';
    
    // If not found, try extracting from image field
    if (!extractedUrl && comboItem.image) {
      extractedUrl = extractImageUrl(comboItem.image);
    }
    
    const itemName = comboItem.name || `option ${index + 1}`;
    const itemId = ensureStringId(comboItem.id);
    
    console.log(`[ComboItemImage] Item ${itemId} (${itemName}): imageUrl="${comboItem.imageUrl}", extracted="${extractedUrl}"`);
    
    if (!extractedUrl) {
      console.log(`[ComboItemImage] No valid image URL found for ${itemName}`);
      setHasError(true);
      return;
    }
    
    // Process the extracted URL 
    let processedSrc = extractedUrl;
    
    try {
      // Try different resolution methods
      processedSrc = resolveSupabaseUrl(processedSrc) || resolvePublicUrl(processedSrc) || processedSrc;
      
      const itemName = comboItem.name || `option ${index + 1}`;
      console.log(`[ComboItemImage] Processed image URL for ${itemName}: ${processedSrc}`);
      setImageUrl(processedSrc);
      setHasError(false);
    } catch (error) {
      console.error(`[ComboItemImage] Error processing image URL:`, error);
      setImageUrl('');
      setHasError(true);
    }
  }, [comboItem.image, comboItem.name, comboItem.id, index]);
  
  if (hasError || !imageUrl) {
    return (
      <div className="bg-gray-100 flex items-center justify-center rounded-md w-full h-full">
        <ImageIcon className="h-5 w-5 text-gray-400" />
      </div>
    );
  }
  
  const itemId = ensureStringId(comboItem.id);
  const itemName = comboItem.name || `Combo option ${index + 1}`;
  
  return (
    <ServiceImage
      src={imageUrl}
      alt={itemName}
      className="w-full h-full object-cover rounded-md"
      aspectRatio="aspect-square"
      imageId={`combo-item-option-${itemId}-${index}`}
      showLoadingPlaceholder={true}
      retryOnError={true}
    />
  );
};

export default ComboItemImage;
