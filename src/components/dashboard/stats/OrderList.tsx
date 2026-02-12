

import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import ServiceImage from "../../shared/ServiceImage";
import { formatCurrency } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  date: string;
  orderNumber: string;
  amount: string;
  status: string;
  rating: number;
  actions: string;
  additionalTip?: string | null;
}

interface OrderListProps {
  orders: OrderItem[];
  onSelect?: (orderId: string) => void;
}

const OrderList = ({ orders, onSelect }: OrderListProps) => {
  return (
    <div className="bg-[#F4F6F8] p-2 sm:p-4 rounded-lg w-full">
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No order history available.</p>
          <p className="mt-2">Completed orders will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {orders.map((order) => (
            <Card 
              key={order.id} 
              className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => onSelect?.(order.id)}
            >
              <div className="flex flex-col gap-2.5">
                {/* Order Header with Image and Title */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="h-[60px] w-[60px] sm:h-[68px] sm:w-[77px] rounded-lg overflow-hidden bg-gray-100">
                    <ServiceImage 
                      src={order.image}
                      alt={order.name} 
                      className="w-full h-full object-cover"
                      aspectRatio="aspect-square"
                      showLoadingPlaceholder={false}
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <h3 className="text-sm sm:text-base font-medium font-['Poppins'] line-clamp-2">{order.name}</h3>
                    <p className="text-xs font-['Poppins']">{order.date}</p>
                  </div>
                </div>
                
                {/* Order Details */}
                <div className="flex flex-col gap-2">
                  {/* Order Number and Amount */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-['Poppins']">{order.orderNumber}</span>
                    <span className="text-sm sm:text-base font-medium font-['Poppins']">{order.amount}</span>
                  </div>
                  
                  {/* Additional Tip */}
                  {order.additionalTip && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-['Poppins'] text-gray-600">Additional Tip:</span>
                      <span className="text-xs font-medium font-['Poppins'] text-gray-900">
                        {formatCurrency(parseFloat(order.additionalTip))}
                      </span>
                    </div>
                  )}
                  
                  {/* Status and Rating Stars */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-['Poppins']">{order.status}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-[14px] w-[14px] sm:h-[15.69px] sm:w-[15.69px] ${star <= order.rating ? 'text-[#FEC84B] fill-[#FEC84B]' : 'text-gray-200'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Links */}
                  <p className="text-xs font-['Poppins'] text-[#469A7E] cursor-pointer hover:underline transition-colors duration-300" onClick={(e) => { e.stopPropagation(); onSelect?.(order.id); }}>{order.actions}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;
