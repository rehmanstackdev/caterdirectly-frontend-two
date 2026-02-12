import { OrderItem } from "@/types/order";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface HostOrderItemsProps {
  orderItems: OrderItem[];
}

const HostOrderItems = ({ orderItems }: HostOrderItemsProps) => {
  if (orderItems.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Order</CardTitle>
        <CardDescription>Items you're ordering for the group</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderItems.map((item) => {
          const imageUrl = item.image || "https://via.placeholder.com/60";
          
          return (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <img 
                  src={imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p className="text-sm">
                  {item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default HostOrderItems;
