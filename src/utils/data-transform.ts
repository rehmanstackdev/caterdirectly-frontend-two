/**
 * Utility functions for safely transforming data from various sources
 * Handles cases where database returns objects instead of expected primitives
 */

// Enhanced utility function to safely extract string from any data type
export const safeStringValue = (value: any, fallback: string = ''): string => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return fallback;
  }
  
  // Already a string
  if (typeof value === 'string') {
    return value.trim();
  }
  
  // Numbers convert cleanly
  if (typeof value === 'number') {
    return String(value);
  }
  
  // Handle objects that might contain the actual string value
  if (value && typeof value === 'object') {
    // Try common properties that might contain the actual value
    const stringFields = ['value', 'text', 'name', 'title', 'label', 'content', 'description'];
    
    for (const field of stringFields) {
      if (value[field] && typeof value[field] === 'string') {
        console.log(`[safeStringValue] Extracted string "${value[field]}" from object field "${field}"`);
        return value[field].trim();
      }
    }
    
    // If it's an array, try the first element
    if (Array.isArray(value) && value.length > 0) {
      return safeStringValue(value[0], fallback);
    }
    
    // Log the object structure to help debug
    console.warn('[safeStringValue] Object without recognizable string field:', {
      type: typeof value,
      keys: Object.keys(value),
      value: value
    });
    
    return fallback;
  }
  
  // Fallback for other types
  return String(value).trim() || fallback;
};

// Enhanced utility function to safely extract image URL from any data type
export const extractImageUrl = (imageData: any): string => {
  if (!imageData) {
    return '';
  }
  
  if (typeof imageData === 'string') {
    return imageData.trim();
  }
  
  if (imageData && typeof imageData === 'object') {
    // Try common object properties that might contain the URL
    const urlFields = ['url', 'src', 'href', 'path', 'image', 'imageUrl', 'image_url', 'file_url', 'public_url', 'fullPath', 'name'];
    
    for (const field of urlFields) {
      if (imageData[field] && typeof imageData[field] === 'string') {
        console.log(`[extractImageUrl] Extracted URL "${imageData[field]}" from object field "${field}"`);
        return imageData[field].trim();
      }
    }
    
    // Try nested objects (like Firebase storage objects)
    if (imageData.metadata && imageData.metadata.fullPath) {
      return imageData.metadata.fullPath;
    }
    
    // If it's an array, try the first element
    if (Array.isArray(imageData) && imageData.length > 0) {
      return extractImageUrl(imageData[0]);
    }
    
    // Try to convert the entire object to string if it looks like a path
    const objStr = String(imageData);
    if (objStr.includes('/') || objStr.includes('http') || objStr.includes('storage')) {
      return objStr.trim();
    }
    
    // Log the object structure to help debug
    console.warn('[extractImageUrl] Image data is object without recognizable URL field:', {
      type: typeof imageData,
      keys: Object.keys(imageData),
      value: imageData
    });
    
    return '';
  }
  
  // Convert other types to string as fallback
  return String(imageData).trim();
};

// Phase 2: Create a simple hash for objects to ensure consistency
const simpleObjectHash = (obj: any): string => {
  try {
    // Sort object keys for consistent hashing
    const sortedKeys = Object.keys(obj).sort();
    const values = sortedKeys.map(key => `${key}:${obj[key]}`);
    return values.join('|');
  } catch {
    return 'hash-error';
  }
};

// Enhanced utility function to ensure ID is always a string
export const ensureStringId = (id: any): string => {
  if (!id) {
    return 'unknown';
  }
  
  if (typeof id === 'string') {
    return id;
  }
  
  if (typeof id === 'number') {
    return String(id);
  }
  
  if (id && typeof id === 'object') {
    // Try common object properties first
    const idFields = ['id', '_id', 'uuid', 'key'];
    
    for (const field of idFields) {
      if (id[field] && (typeof id[field] === 'string' || typeof id[field] === 'number')) {
        return String(id[field]);
      }
    }
    
    // Phase 2: Use consistent hash instead of JSON.stringify for object IDs
    // This ensures the same object always produces the same string ID
    const hash = simpleObjectHash(id);
    if (import.meta.env.DEV) {
      console.warn('[ensureStringId] Using hash for complex ID:', hash);
    }
    return `obj-${hash}`;
  }
  
  return String(id);
};

// Debug utility to log data structure for troubleshooting
export const debugDataStructure = (data: any, label: string) => {
  console.group(`[DEBUG] ${label}`);
  console.log('Type:', typeof data);
  console.log('Value:', data);
  
  if (data && typeof data === 'object') {
    console.log('Keys:', Object.keys(data));
    console.log('Structure:', JSON.stringify(data, null, 2));
  }
  
  console.groupEnd();
};