import { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FileUpload from "@/components/shared/FileUpload";
import { UseFormReturn } from "react-hook-form";
import { useImageUpload } from "@/hooks/services/use-image-upload";
import { SERVICE_IMAGES_BUCKET } from "@/utils/supabase-storage-utils";
import { toast } from "@/hooks/use-toast";
import { storeImage, getStoredImage } from "@/utils/image-store";

interface EventImageUploadProps {
  form: UseFormReturn<any>;
}

const EventImageUpload = ({ form }: EventImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const imageValue = form.watch("image");

  const handleFileUploadComplete = async (imageUrl: string) => {
    console.log("EventImageUpload: Upload complete", { imageUrl });

    try {
      // Convert blob URL to base64 and store it
      // If it's already a blob URL, convert it to a stored image
      if (imageUrl.startsWith("blob:")) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            try {
              const base64String = reader.result as string;
              // Store the image and get a lovable-uploads URL
              const storedUrl = storeImage(
                base64String,
                `event-image-${Date.now()}.png`,
              );
              form.setValue("image", storedUrl, { shouldValidate: true });
              setUploading(false);
              toast({
                title: "Image uploaded",
                description: "Your event image has been uploaded successfully",
              });
              resolve();
            } catch (error) {
              console.error("EventImageUpload: Error storing image:", error);
              setUploading(false);
              toast({
                title: "Upload failed",
                description: "Failed to store the uploaded image",
                variant: "destructive",
              });
              reject(error);
            }
          };

          reader.onerror = () => {
            console.error("EventImageUpload: Error reading blob");
            setUploading(false);
            toast({
              title: "Upload failed",
              description: "Failed to process the uploaded image",
              variant: "destructive",
            });
            reject(new Error("Failed to read blob"));
          };

          reader.readAsDataURL(blob);
        });
      } else {
        // If it's already a URL, just use it
        form.setValue("image", imageUrl, { shouldValidate: true });
        setUploading(false);
      }
    } catch (error) {
      console.error("EventImageUpload: Error processing image URL:", error);
      setUploading(false);
      toast({
        title: "Upload failed",
        description: "Failed to process the uploaded image",
        variant: "destructive",
      });
    }
  };

  const { uploadImage, isUploading } = useImageUpload({
    bucketName: SERVICE_IMAGES_BUCKET,
    onSuccess: (url) => {
      handleFileUploadComplete(url);
    },
    onError: (error) => {
      setUploading(false);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    console.log("EventImageUpload: Starting image upload", {
      fileName: file.name,
      fileSize: file.size,
    });
    setUploading(true);
    try {
      // Upload the image using the hook
      await uploadImage(file);
    } catch (error) {
      console.error("EventImageUpload: Error uploading image:", error);
      setUploading(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Event Image</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {imageValue ? (
                <div className="relative border rounded-md overflow-hidden">
                  <img
                    src={(() => {
                      if (imageValue.startsWith("lovable-uploads/")) {
                        const storedImageData = getStoredImage(imageValue);
                        if (
                          storedImageData &&
                          storedImageData.startsWith("data:")
                        ) {
                          return storedImageData;
                        }
                        return `/${imageValue}`;
                      }
                      if (imageValue.startsWith("blob:")) {
                        return imageValue;
                      }
                      if (imageValue.startsWith("data:")) {
                        return imageValue;
                      }
                      return imageValue;
                    })()}
                    alt="Event preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      console.error(
                        "EventImageUpload: Image failed to load",
                        imageValue,
                      );
                      e.currentTarget.src =
                        "/lovable-uploads/5a0003fb-1412-482d-a6cb-4352fc398d2d.png";
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      console.log("EventImageUpload: Image removed");
                      form.setValue("image", "");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <FileUpload
                  onFileUpload={handleFileUpload}
                  uploading={uploading || isUploading}
                  className="h-48"
                  maxSize={5}
                  acceptedFileTypes={[
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif",
                  ]}
                />
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EventImageUpload;
