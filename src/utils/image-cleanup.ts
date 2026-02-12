/**
 * Utility functions for cleaning up legacy image storage and handling
 * This file helps with the migration from multiple image systems to unified system
 */

/**
 * Clean up localStorage image data that's no longer needed
 * Since we're moving to Supabase-only storage
 */
export function cleanupLocalStorageImages(): { removed: number; totalSize: number } {
  let removed = 0;
  let totalSize = 0;
  
  const keysToRemove: string[] = [];
  
  // Find all localStorage keys that contain image data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('image_') ||
      key.includes('lovable-uploads') ||
      key.startsWith('uploaded_image_') ||
      key.includes('cached_image')
    )) {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length;
        keysToRemove.push(key);
      }
    }
  }
  
  // Remove the identified keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    removed++;
  });
  
  console.log(`[Image Cleanup] Removed ${removed} localStorage image entries, freed ${Math.round(totalSize / 1024)}KB`);
  
  return { removed, totalSize };
}

/**
 * Validate all service images in a batch and report issues
 */
export async function validateServiceImages(services: any[]): Promise<{
  valid: string[];
  invalid: string[];
  missing: string[];
  report: string;
}> {
  const valid: string[] = [];
  const invalid: string[] = [];
  const missing: string[] = [];
  
  const results = await Promise.allSettled(
    services.map(async (service) => {
      const images = extractAllServiceImages(service);
      const imageTests = await Promise.allSettled(
        images.map(url => testImageUrl(url))
      );
      
      return {
        service: service.name || service.id,
        images,
        results: imageTests.map((result, index) => ({
          url: images[index],
          valid: result.status === 'fulfilled' && result.value
        }))
      };
    })
  );
  
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const { service, results: imageResults } = result.value;
      
      if (imageResults.length === 0) {
        missing.push(service);
      } else {
        const hasValidImage = imageResults.some(r => r.valid);
        if (hasValidImage) {
          valid.push(service);
        } else {
          invalid.push(service);
        }
      }
    }
  });
  
  const report = `
Image Validation Report:
- Services with valid images: ${valid.length}
- Services with only invalid images: ${invalid.length}
- Services with no images: ${missing.length}
- Total services checked: ${services.length}
- Success rate: ${Math.round((valid.length / services.length) * 100)}%
  `;
  
  return { valid, invalid, missing, report };
}

/**
 * Extract all possible image URLs from a service object
 */
function extractAllServiceImages(service: any): string[] {
  const images: string[] = [];
  
  // Main image
  if (typeof service.image === 'string' && service.image.trim()) {
    images.push(service.image);
  }
  
  // Service details images
  if (service.service_details) {
    const details = service.service_details;
    
    if (typeof details.coverImage === 'string' && details.coverImage.trim()) {
      images.push(details.coverImage);
    }
    
    if (typeof details.menuImage === 'string' && details.menuImage.trim()) {
      images.push(details.menuImage);
    }
    
    if (Array.isArray(details.images)) {
      details.images.forEach((img: any) => {
        if (typeof img === 'string' && img.trim()) {
          images.push(img);
        }
      });
    }
    
    // Catering specific
    if (details.catering?.menuImage && typeof details.catering.menuImage === 'string') {
      images.push(details.catering.menuImage);
    }
  }
  
  return images.filter((img, index, arr) => arr.indexOf(img) === index); // Remove duplicates
}

/**
 * Simple image URL tester
 */
async function testImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => resolve(false), 3000);
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    try {
      img.src = url;
    } catch {
      clearTimeout(timeout);
      resolve(false);
    }
  });
}

/**
 * Generate migration report for moving from old image system to new unified system
 */
export function generateMigrationReport(): {
  oldHooksUsage: string[];
  oldComponentsUsage: string[];
  recommendations: string[];
} {
  const oldHooksUsage = [
    'useSimpleServiceImage - Replace with useUnifiedServiceImage',
    'useServiceImage - Replace with useUnifiedServiceImage', 
    'useOptimizedServiceImage - Replace with useUnifiedServiceImage'
  ];
  
  const oldComponentsUsage = [
    'SimpleImage - Replace with UnifiedImage',
    'ServiceImage - Already migrated (wrapper around UnifiedImage)',
    'OptimizedServiceImage - Already migrated (wrapper around UnifiedImage)'
  ];
  
  const recommendations = [
    '1. Update all marketplace components to use useUnifiedServiceImage hook',
    '2. Replace direct SimpleImage usage with UnifiedImage component',
    '3. Remove localStorage image cleanup by running cleanupLocalStorageImages()',
    '4. Monitor image performance with ImageHealthDashboard',
    '5. Test image validation with validateServiceImages() function',
    '6. Remove old hook files after migration is complete'
  ];
  
  return {
    oldHooksUsage,
    oldComponentsUsage,
    recommendations
  };
}