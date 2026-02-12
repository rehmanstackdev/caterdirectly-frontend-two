
/**
 * Utility functions for storing and retrieving images from localStorage
 */

// Function to retrieve an image from localStorage by its URL path
export const getStoredImage = (url: string): string | null => {
  if (!url) {
    console.log('No image URL provided to getStoredImage');
    return null;
  }
  
  console.log('Getting stored image for URL:', url);
  
  // Handle lovable-uploads format URLs
  if (url.startsWith('lovable-uploads/')) {
    // Try with the full path as key
    const imageKey = url.replace('lovable-uploads/', '');
    console.log('Looking for image with key:', imageKey);
    
    let imageData = localStorage.getItem(imageKey);
    
    // If not found, try just the filename part
    if (!imageData) {
      const fileNameKey = url.split('/').pop();
      if (fileNameKey) {
        console.log('First attempt failed. Trying with filename key:', fileNameKey);
        imageData = localStorage.getItem(fileNameKey);
      }
    }
    
    // If still not found with direct keys, try every file path variation
    if (!imageData) {
      // Try removing any query parameters
      const cleanUrl = url.split('?')[0];
      const cleanKey = cleanUrl.replace('lovable-uploads/', '');
      if (cleanKey !== imageKey) {
        console.log('Trying with clean key (no query params):', cleanKey);
        imageData = localStorage.getItem(cleanKey);
      }
      
      // Try extracting just the filename with no path
      const filenameOnly = cleanUrl.split('/').pop();
      if (filenameOnly && filenameOnly !== cleanKey) {
        console.log('Trying with filename only:', filenameOnly);
        imageData = localStorage.getItem(filenameOnly);
      }
      
      // Try UUID pattern extraction (common in generated filenames)
      const uuidMatch = url.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (uuidMatch && uuidMatch[1]) {
        console.log('Trying with extracted UUID:', uuidMatch[1]);
        imageData = localStorage.getItem(uuidMatch[1]);
      }
    }
    
    // If still not found, try all keys that include a substring of the URL
    if (!imageData) {
      console.log('Attempting fuzzy match for image key');
      const searchSubstring = url.split('/').pop();
      if (searchSubstring && searchSubstring.length > 8) {
        console.log('Searching for substring:', searchSubstring);
        // Look through all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes(searchSubstring)) {
            console.log('Found potential match:', key);
            imageData = localStorage.getItem(key);
            break;
          }
        }
      }
    }
    
    console.log('Image data found:', !!imageData);
    return imageData;
  }
  
  // Return the URL as-is for external images
  return url;
};

// Function to store an image in localStorage and return a lovable-uploads URL
export const storeImage = (imageData: string, filename: string): string => {
  const safeFilename = getSafeFilename(filename);
  const imageKey = `service_image_${Date.now()}_${safeFilename}`;
  
  console.log('Storing image with key:', imageKey);
  
  // Use safe storage method to handle quota issues
  try {
    import('./storage-manager').then(({ safeSetItem }) => {
      if (!safeSetItem(imageKey, imageData)) {
        console.warn('Failed to store image due to storage quota');
      }
    });
  } catch (error) {
    // Fallback to direct localStorage if storage manager fails
    try {
      localStorage.setItem(imageKey, imageData);
    } catch (storageError) {
      console.error('Failed to store image:', storageError);
      throw new Error('Storage quota exceeded. Please clear some space and try again.');
    }
  }
  
  const url = `lovable-uploads/${imageKey}`;
  console.log('Generated URL for image:', url);
  
  return url;
};

// Function to remove an image from localStorage
export const removeStoredImage = (url: string): boolean => {
  if (!url || !url.startsWith('lovable-uploads/')) return false;
  
  const imageKey = url.replace('lovable-uploads/', '');
  console.log('Removing image with key:', imageKey);
  
  if (localStorage.getItem(imageKey)) {
    localStorage.removeItem(imageKey);
    console.log('Image removed successfully');
    return true;
  }
  
  console.log('Image not found for removal');
  return false;
};

// Function to generate a unique image key
export const generateImageKey = (filename: string): string => {
  return `service_image_${Date.now()}_${getSafeFilename(filename)}`;
};

// Function to sanitize a filename
export const getSafeFilename = (filename: string): string => {
  // Remove path information
  let safe = filename.split(/[\\/]/).pop() || filename;
  
  // Replace special characters
  safe = safe.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return safe;
};

// Debug function to list all stored images
export const listStoredImages = (): void => {
  console.log('--- Listing all stored images ---');
  let count = 0;
  Object.keys(localStorage).forEach(key => {
    if (key.includes('service_image_') || key.includes('image') || 
        key.includes('.png') || key.includes('.jpg') || key.includes('.jpeg')) {
      console.log('Found stored image:', key);
      count++;
    }
  });
  console.log(`--- End of stored images list (${count} images found) ---`);
};

// Function to attempt to recover a specific image by searching all keys
export const recoverImageByFilename = (filename: string): string | null => {
  console.log(`Attempting to recover image with filename: ${filename}`);
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(filename)) {
      console.log('Found matching key:', key);
      return localStorage.getItem(key);
    }
  }
  
  console.log('No matching image found');
  return null;
};
