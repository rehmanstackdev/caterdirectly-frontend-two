import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const OrderCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4 space-y-4">
        <div>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-20 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="text-right">
            <Skeleton className="h-5 w-8 mb-1" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCardSkeleton;