import { Skeleton } from '@/components/ui/skeleton';

export const ConversationSkeleton = () => {
  return (
    <div className="space-y-1">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="p-3 border-l-4 border-l-transparent">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-3 w-32" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};