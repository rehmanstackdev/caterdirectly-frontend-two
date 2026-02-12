import { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Loader, Upload, Image, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { compressImage, isCompressibleImage, formatFileSize, COMPRESSION_PRESETS, type CompressionOptions } from '@/utils/image-compression';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onFileUploadComplete?: (url: string) => void;
  maxSize?: number; // in MB
  acceptedFileTypes?: string[];
  className?: string;
  uploading?: boolean;
  compressionType?: 'service' | 'menu' | 'avatar' | 'none';
  compressionOptions?: CompressionOptions;
  showCompressionInfo?: boolean;
}

const FileUpload = ({
  onFileUpload,
  onFileUploadComplete,
  maxSize = 5, // Default 5MB
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  uploading = false,
  compressionType = 'service',
  compressionOptions,
  showCompressionInfo = true
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number;
    compressedSize: number;
    savings: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!acceptedFileTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file",
        variant: "destructive"
      });
      return;
    }

    let fileToUpload = file;

    // Compress image if it's compressible and compression is enabled
    if (compressionType !== 'none' && isCompressibleImage(file)) {
      try {
        setCompressing(true);
        console.log(`[FileUpload] Compressing image with preset: ${compressionType}`);
        
        const options = compressionOptions || COMPRESSION_PRESETS[compressionType];
        const result = await compressImage(file, options);
        
        fileToUpload = result.compressedFile;
        
        // Set compression info for display
        if (showCompressionInfo) {
          setCompressionInfo({
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
            savings: result.compressionRatio
          });
        }
        
        console.log(`[FileUpload] Compression complete. Original: ${formatFileSize(result.originalSize)}, Compressed: ${formatFileSize(result.compressedSize)}, Savings: ${result.compressionRatio}%`);
      } catch (error) {
        console.error('[FileUpload] Compression failed, using original file:', error);
        // Continue with original file if compression fails
      } finally {
        setCompressing(false);
      }
    }

    // Create local preview URL for immediate display
    const previewUrl = URL.createObjectURL(fileToUpload);
    setLocalPreviewUrl(previewUrl);
    
    // Call the onFileUpload callback to notify parent component
    onFileUpload(fileToUpload);
    
    
  }, [onFileUpload, maxSize, acceptedFileTypes, compressionType, compressionOptions, showCompressionInfo]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: acceptedFileTypes.reduce((acc, curr) => {
      return { ...acc, [curr]: [] };
    }, {}),
    maxSize: maxSize * 1024 * 1024,
    multiple: false
  });
  
  useEffect(() => {
    setIsDragging(isDragActive);
  }, [isDragActive]);

  // Clear preview when upload completes successfully
  useEffect(() => {
    if (!uploading && !compressing && localPreviewUrl) {
      const timer = setTimeout(() => {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
        setCompressionInfo(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [uploading, compressing, localPreviewUrl]);

  return (
    <div className="space-y-4">
      {/* Show preview if we have a local preview URL */}
      {localPreviewUrl && (compressing || uploading) && (
        <div className="relative w-full h-40 border rounded-md overflow-hidden bg-gray-50">
          <img
            src={localPreviewUrl}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">
                {compressing ? 'Compressing...' : 'Uploading...'}
              </p>
              {compressionInfo && showCompressionInfo && !compressing && (
                <p className="text-xs mt-1 opacity-75">
                  Saved {compressionInfo.savings}% • {formatFileSize(compressionInfo.originalSize - compressionInfo.compressedSize)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div 
        {...getRootProps()} 
        className={`border-2 ${isDragging ? 'border-[#F07712] bg-[#F07712]/5' : 'border-dashed border-gray-300'} 
          rounded-lg p-8 text-center hover:bg-gray-50 transition-all cursor-pointer ${className}`}
      >
        <input {...getInputProps()} ref={inputRef} />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading || compressing ? (
            <Loader className="h-8 w-8 text-[#F07712] animate-spin" />
          ) : (
            <div className="bg-[#F07712]/10 rounded-full p-3">
              <Upload className="h-6 w-6 text-[#F07712]" />
            </div>
          )}
          
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {compressing ? 'Compressing...' : uploading ? 'Uploading...' : 'Drag & drop an image here'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WEBP or GIF (max. {maxSize}MB)
              {compressionType !== 'none' && ' • Auto-compressed for faster upload'}
            </p>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="mt-2"
            disabled={uploading || compressing}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            <Image className="h-4 w-4 mr-2" />
            Browse files
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;