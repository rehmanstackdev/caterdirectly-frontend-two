
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Upload, Check, AlertTriangle, Info } from "lucide-react";
import { startImageMigration } from '@/utils/service-utils';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useServices } from '@/hooks/use-services';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";

export function ImageMigrationTool() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'migrating' | 'completed' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [unmigrated, setUnmigrated] = useState(0);
  const { services, refreshServices } = useServices();

  useEffect(() => {
    // Check for unmigrated images
    const checkUnmigratedImages = async () => {
      try {
        const nonSupabaseImages = services.filter(service => 
          service.image && !service.image.includes('supabase.co')
        ).length;
        
        // Also check for unmigrated menu images
        let unmigatedMenuImages = 0;
        services.forEach(service => {
          if (service.type === 'catering' && service.service_details) {
            const details = service.service_details;
            if (details.menuImage && !details.menuImage.includes('supabase.co')) {
              unmigatedMenuImages++;
            } else if (details.catering?.menuImage && !details.catering.menuImage.includes('supabase.co')) {
              unmigatedMenuImages++;
            }
          }
        });
        
        setUnmigrated(nonSupabaseImages + unmigatedMenuImages);
      } catch (error) {
        console.error('Error checking unmigrated images:', error);
      }
    };
    
    checkUnmigratedImages();
  }, [services]);

  const handleStartMigration = async () => {
    try {
      setIsMigrating(true);
      setStatus('migrating');
      setMessage('Migration in progress. This may take a few minutes.');
      
      // Simulate progress while the actual migration runs
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 5;
        });
      }, 500);
      
      // Start the migration
      await startImageMigration();
      
      // Clear the interval and set to 100%
      clearInterval(progressInterval);
      setProgress(100);
      setStatus('completed');
      setMessage('Migration completed successfully!');
      
      // Refresh services to get updated image URLs
      await refreshServices();
      
      // Recheck for unmigrated images
      const nonSupabaseImages = services.filter(service => 
        service.image && !service.image.includes('supabase.co')
      ).length;
      
      setUnmigrated(nonSupabaseImages);
    } catch (error) {
      console.error('Migration error:', error);
      setStatus('error');
      setMessage('An error occurred during migration. Please check the console for details.');
    } finally {
      setIsMigrating(false);
    }
  };

  const badgeColor = unmigrated > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800';
  const badgeText = unmigrated > 0 ? `${unmigrated} images need migration` : 'All images migrated';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Image Migration Tool
          </CardTitle>
          <Badge className={badgeColor}>{badgeText}</Badge>
        </div>
        <CardDescription>
          Migrate service images from localStorage to Supabase Storage for improved reliability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 border">
            <h3 className="font-medium mb-2">Why migrate?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>Reliable image storage that persists between browser sessions</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>Consistent image URLs across all devices</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>Improved performance and reliability</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>Better support for menu images in service cards</span>
              </li>
            </ul>
          </div>
          
          {status !== 'idle' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">
                  {status === 'migrating' ? 'Migration Progress' : status === 'completed' ? 'Migration Complete' : 'Migration Error'}
                </div>
                <div className="text-sm">{Math.round(progress)}%</div>
              </div>
              <Progress value={progress} className="h-2" />
              <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-gray-500'}`}>
                {status === 'error' ? (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" /> {message}
                  </span>
                ) : (
                  message
                )}
              </p>
            </div>
          )}
          
          {unmigrated > 0 && status === 'idle' && (
            <div className="flex items-center p-3 bg-yellow-50 rounded-md text-yellow-800 text-sm">
              <Info className="h-4 w-4 mr-2" />
              <p>There are {unmigrated} services with images that need to be migrated to Supabase for reliable multi-device access.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button 
                  className="w-full"
                  onClick={handleStartMigration}
                  disabled={isMigrating || unmigrated === 0}
                >
                  {isMigrating ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Migrating Images...
                    </>
                  ) : status === 'completed' ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Migration Complete
                    </>
                  ) : unmigrated === 0 ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      All Images Migrated
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Start Migration ({unmigrated} Images)
                    </>
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {unmigrated === 0 
                ? "All images are already stored in Supabase" 
                : `Click to migrate ${unmigrated} images to Supabase Storage`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
