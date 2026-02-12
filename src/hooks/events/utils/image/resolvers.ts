
import { UrlResolutionOptions } from './types';

/**
 * ENHANCED: Test if an image URL is valid and loadable with better timeout handling
 */
export async function testImageUrl(url: string, timeout: number = 5000): Promise<boolean> {
  if (!url || typeof url !== 'string' || url.includes('placeholder')) return true;
  if (!isValidImageUrl(url)) return false;

  // For Supabase Storage URLs, do NOT attempt to validate or trust them here
  // to avoid making direct requests to the Supabase storage public API.
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('supabase') && url.includes('/storage/v1/object/public/')) {
      return false; // Treat Supabase public storage URLs as unavailable here
    }
    
    // Skip validation for known good hosts
    const knownGoodHosts = ['unsplash.com', 'images.unsplash.com', 'via.placeholder.com'];
    if (knownGoodHosts.some(host => urlObj.hostname.includes(host))) {
      return true;
    }
  } catch {
    // Invalid URL format, continue with testing
  }

  return new Promise<boolean>((resolve) => {
    const img = new Image();
    let resolved = false;

    // Set a longer timeout for slower connections
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.log(`[testImageUrl] Timeout testing URL: ${url}`);
        resolve(false);
      }
    }, timeout);

    img.onload = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        console.log(`[testImageUrl] Successfully validated: ${url}`);
        resolve(true);
      }
    };

    img.onerror = (error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        console.log(`[testImageUrl] Failed to load: ${url}`, error);
        resolve(false);
      }
    };

    try {
      // Set crossOrigin to handle CORS better
      img.crossOrigin = 'anonymous';
      img.src = url;
    } catch (error) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutId);
        console.error(`[testImageUrl] Error setting src: ${url}`, error);
        resolve(false);
      }
    }
  });
}

/**
 * ENHANCED: More permissive image URL validation with better format detection
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  // First check: ensure url is a string and not empty
  if (typeof url !== 'string' || !url) return false;
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return false;
  
  // Allow data URLs
  if (trimmedUrl.startsWith('data:image')) return true;
  
  // Allow placeholder URLs
  if (trimmedUrl.includes('placeholder') || trimmedUrl.includes('via.placeholder')) return true;
  
  // Allow any HTTP/HTTPS URL - let the browser determine if it's an image
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) return true;
  
  // Allow relative URLs
  if (trimmedUrl.startsWith('/')) return true;
  
  // Check for URLs from known image hosts
  const isKnownImageHost = 
    trimmedUrl.includes('cloudinary.com') ||
    trimmedUrl.includes('storage.googleapis.com') ||
    trimmedUrl.includes('amazonaws.com') ||
    trimmedUrl.includes('s3.amazonaws.com') ||
    trimmedUrl.includes('unsplash.com') ||
    trimmedUrl.includes('images.unsplash.com') ||
  // Do not treat Supabase storage as a known good host to prevent direct calls
    trimmedUrl.includes('lovable-uploads') ||
    trimmedUrl.includes('imgur.com') ||
    trimmedUrl.includes('cdn.');

  // Check common image extensions
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.jfif', '.bmp'];
  const hasValidExtension = validExtensions.some(ext => 
    trimmedUrl.toLowerCase().includes(ext)
  );

  // Be permissive: allow if it has a valid extension OR is from a known host OR looks like a URL
  return hasValidExtension || isKnownImageHost || trimmedUrl.startsWith('http') || trimmedUrl.startsWith('/');
}

/**
 * ENHANCED: Resolve Supabase Storage URLs with better error handling and multiple base URL support
 */
export function resolveSupabaseUrl(url: string | null | undefined): string {
  if (typeof url !== 'string' || !url) return '';
  
  const trimmedUrl = url.trim();
  
  // If already a complete HTTP URL, return as-is
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // Handle different Supabase URL formats
  if (trimmedUrl.includes('storage/v1/object/public/') || (trimmedUrl.includes('supabase') && trimmedUrl.includes('storage'))) {
    // Do not construct or return Supabase public storage URLs here — return empty
    console.log(`[resolveSupabaseUrl] Supabase public storage URL detected, returning empty to avoid external call: ${trimmedUrl}`);
    return '';
  }
  
  // Handle partial Supabase URLs
  if (trimmedUrl.includes('supabase') && trimmedUrl.includes('storage')) {
    // If it contains supabase and storage but isn't complete, try to fix it
    if (!trimmedUrl.startsWith('http')) {
      const cleanUrl = trimmedUrl.replace(/^\/+/, '');
      const resolvedUrl = `https://aykzhgjywakjzkphokco.supabase.co/${cleanUrl}`;
      console.log(`[resolveSupabaseUrl] Fixed partial URL: ${trimmedUrl} -> ${resolvedUrl}`);
      return resolvedUrl;
    }
  }
  
  return trimmedUrl;
}

/**
 * ENHANCED: Resolve public URLs with better path handling
 */
export function resolvePublicUrl(path: string | null | undefined): string {
  if (typeof path !== 'string' || !path) return '';
  
  const trimmedPath = path.trim();
  
  // Handle lovable-uploads paths
  if (trimmedPath.includes('lovable-uploads/')) {
    // Ensure the path starts with a slash if it's not already a complete URL
    if (!trimmedPath.startsWith('http') && !trimmedPath.startsWith('/')) {
      const resolvedPath = `/${trimmedPath}`;
      console.log(`[resolvePublicUrl] Fixed public path: ${trimmedPath} -> ${resolvedPath}`);
      return resolvedPath;
    }
  }
  
  return trimmedPath;
}

/**
 * Create multiple URL variations to handle case sensitivity and extension issues
 */
export function createImageUrlVariants(url: string): string[] {
  if (!url) return [];
  
  const variants: string[] = [url]; // Original URL first
  
  // Handle case sensitivity for file extensions
  const extensionPatterns = [
    { from: /\.jpg$/i, variants: ['.jpg', '.JPG', '.jpeg', '.JPEG'] },
    { from: /\.jpeg$/i, variants: ['.jpeg', '.JPEG', '.jpg', '.JPG'] },
    { from: /\.png$/i, variants: ['.png', '.PNG'] },
    { from: /\.webp$/i, variants: ['.webp', '.WEBP'] },
    { from: /\.jfif$/i, variants: ['.jfif', '.JFIF', '.jpg', '.JPG'] }
  ];
  
  for (const pattern of extensionPatterns) {
    if (pattern.from.test(url)) {
      const baseUrl = url.replace(pattern.from, '');
      pattern.variants.forEach(ext => {
        const variant = baseUrl + ext;
        if (!variants.includes(variant)) {
          variants.push(variant);
        }
      });
      break;
    }
  }
  
  return variants;
}

/**
 * Test multiple image URL variations with fallback
 */
export async function testImageUrlWithFallback(url: string, timeout: number = 5000): Promise<string | null> {
  if (!url) return null;
  
  // For Supabase URLs, be more permissive - assume they work if properly formatted
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('supabase') && url.includes('/storage/v1/object/public/')) {
      // Avoid trusting Supabase storage URLs to prevent direct browser requests
      return null;
    }
  } catch {
    // Invalid URL format, continue with testing
  }
  
  const variants = createImageUrlVariants(url);
  
  for (const variant of variants) {
    try {
      const isValid = await testImageUrl(variant, timeout);
      if (isValid) {
        return variant;
      }
    } catch (error) {
      // Continue to next variant
      continue;
    }
  }
  
  return null;
}

/**
 * Add a cache buster to a URL to force a fresh load
 */
export function addCacheBuster(url: string | null | undefined): string {
  if (typeof url !== 'string' || !url) return '';
  
  const delimiter = url.includes('?') ? '&' : '?';
  return `${url}${delimiter}cb=${Date.now()}`;
}
