
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface ServiceDetailsLoaderProps {
  loading: boolean;
  serviceExists: boolean;
}

const ServiceDetailsLoader = ({
  loading,
  serviceExists,
}: ServiceDetailsLoaderProps) => {
  if (!loading && !serviceExists) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">Service not found</h3>
        <p className="mt-2 text-gray-500">
          The service you are looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      <div className="flex items-start gap-4">
        <Skeleton className="h-20 w-20 rounded-md" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>

      <Skeleton className="h-40 w-full rounded-md" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div>
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsLoader;
