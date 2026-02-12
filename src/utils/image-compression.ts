/**
 * Image compression utilities for optimizing uploads
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  thumbnail?: File;
}

/**
 * Default compression settings for different image types
 */
export const COMPRESSION_PRESETS = {
  service: {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.85,
    format: 'jpeg' as const,
    generateThumbnail: true,
    thumbnailSize: 300
  },
  menu: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.85,
    format: 'jpeg' as const,
    generateThumbnail: true,
    thumbnailSize: 200
  },
  avatar: {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.90,
    format: 'jpeg' as const,
    generateThumbnail: true,
    thumbnailSize: 100
  }
} as const;

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // Scale down if needed
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  return { width, height };
}

/**
 * Generate a thumbnail from an image
 */
async function generateThumbnail(
  img: HTMLImageElement,
  size: number,
  format: string,
  quality: number
): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context for thumbnail');
  }

  // Calculate square thumbnail dimensions
  const sourceSize = Math.min(img.naturalWidth, img.naturalHeight);
  const sourceX = (img.naturalWidth - sourceSize) / 2;
  const sourceY = (img.naturalHeight - sourceSize) / 2;

  canvas.width = size;
  canvas.height = size;

  // Draw thumbnail
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(
    img,
    sourceX, sourceY, sourceSize, sourceSize,
    0, 0, size, size
  );

  // Convert to blob
  const mimeType = `image/${format}`;
  const thumbnailBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Thumbnail generation failed'));
        }
      },
      mimeType,
      quality
    );
  });

  return new File([thumbnailBlob], 'thumbnail.jpg', { type: mimeType });
}

/**
 * Compress an image file with the specified options
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.85,
    format = 'jpeg',
    generateThumbnail: shouldGenerateThumbnail = false,
    thumbnailSize = 200
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = async () => {
      try {
        // Calculate new dimensions
        const { width, height } = calculateDimensions(
          img.naturalWidth,
          img.naturalHeight,
          maxWidth,
          maxHeight
        );

        // Create canvas for main image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress main image
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        const mimeType = `image/${format}`;
        const compressedBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            mimeType,
            quality
          );
        });

        // Create compressed file
        const compressedFile = new File(
          [compressedBlob],
          `compressed_${file.name}`,
          { type: mimeType }
        );

        // Generate thumbnail if requested
        let thumbnail: File | undefined;
        if (shouldGenerateThumbnail) {
          thumbnail = await generateThumbnail(img, thumbnailSize, format, quality);
        }

        // Calculate compression metrics
        const originalSize = file.size;
        const compressedSize = compressedFile.size;
        const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

        resolve({
          compressedFile,
          originalSize,
          compressedSize,
          compressionRatio,
          thumbnail
        });

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if a file type supports compression
 */
export function isCompressibleImage(file: File): boolean {
  const compressibleTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return compressibleTypes.includes(file.type);
}