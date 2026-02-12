
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Clock, Package, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderRequest {
  id: string;
  customer: {
    name: string;
    avatar?: string;
  };
  orderId: string;
  items: string;
  time: string;
  timeFormatted: string;
  total: string;
}

const mockOrderRequests: OrderRequest[] = [
  {
    id: "1",
    customer: {
      name: "John Doe",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop"
    },
    orderId: "#ORD-001",
    items: "2 items\n1x Chicken Burger",
    time: "5 min ago",
    timeFormatted: "12:45 PM",
    total: "$45.99"
  },
  {
    id: "2",
    customer: {
      name: "Mike Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2787&auto=format&fit=crop"
    },
    orderId: "#ORD-002",
    items: "2 items\n1x Chicken Burger",
    time: "5 min ago",
    timeFormatted: "12:45 PM",
    total: "$45.99"
  },
  {
    id: "3",
    customer: {
      name: "Sarah Davis",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2787&auto=format&fit=crop"
    },
    orderId: "#ORD-003",
    items: "2 items\n1x Chicken Burger",
    time: "5 min ago",
    timeFormatted: "12:45 PM",
    total: "$189.99"
  }
];

const NewOrderRequests: React.FC = () => {
  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>(mockOrderRequests);

  const handleAccept = (id: string) => {
    toast({
      title: "Order Accepted",
      description: `You have accepted order ${id}`,
    });
    setOrderRequests(orderRequests.filter(order => order.id !== id));
  };

  const handleDecline = (id: string) => {
    toast({
      title: "Order Declined",
      description: `You have declined order ${id}`,
    });
    setOrderRequests(orderRequests.filter(order => order.id !== id));
  };

  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-poppins text-lg font-medium text-gray-800">New Order Requests</h3>
      
      <div className="bg-gradient-to-br from-[#F5F5F8] to-white rounded-xl p-4 md:p-5 shadow-sm border border-[#EAEAEC]">
        {/* Header row */}
        <div className="bg-white rounded-xl p-3 mb-4 shadow-sm">
          <div className="grid grid-cols-12 gap-2 text-[#1A1F2C] font-poppins font-medium text-sm md:text-base">
            <div className="col-span-2">Customer</div>
            <div className="col-span-2">Order ID</div>
            <div className="col-span-2">Order Details</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-2">Total</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
        </div>
        
        {/* Order rows */}
        <div className="flex flex-col gap-4">
          {orderRequests.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-4 transition-all duration-300 hover:shadow-md">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-2 flex items-center gap-2">
                  <Avatar className="w-8 h-8 md:w-10 md:h-10 ring-2 ring-[#F1F0FB] ring-offset-1">
                    <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                    <AvatarFallback className="bg-[#9b87f5] text-white">{order.customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-gray-700 font-poppins font-normal text-xs md:text-sm truncate">{order.customer.name}</span>
                </div>
                
                <div className="col-span-2 text-gray-700 font-poppins font-medium text-xs md:text-sm">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-[#9b87f5]" />
                    <span>{order.orderId}</span>
                  </div>
                </div>
                
                <div className="col-span-2 text-gray-600 font-poppins font-normal text-xs whitespace-pre-line">
                  {order.items}
                </div>
                
                <div className="col-span-2 text-gray-600 font-poppins font-normal text-xs md:text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#9b87f5]" />
                    <div>
                      <div>{order.time}</div>
                      <div className="text-gray-500">{order.timeFormatted}</div>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 text-gray-700 font-poppins font-medium text-xs md:text-sm">
                  {order.total}
                </div>
                
                <div className="col-span-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={() => handleAccept(order.id)}
                    size="sm"
                    className="px-2 py-1 h-7 md:h-8 md:px-3 bg-[#EEFEF7] hover:bg-[#DAFBEF] text-[#18A47A] border border-[#B6EFD9] rounded-lg shadow-sm font-poppins font-medium text-xs transition-all duration-150 hover:scale-[1.02] truncate whitespace-nowrap"
                    variant="ghost"
                  >
                    <CheckCheck className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 stroke-[2.5px]" /> <span className="hidden sm:inline">Accept</span>
                  </Button>
                  <Button
                    onClick={() => handleDecline(order.id)}
                    size="sm"
                    className="px-2 py-1 h-7 md:h-8 md:px-3 bg-[#FFF0F0] hover:bg-[#FFE6E6] text-[#E53939] border border-[#FFD1D1] rounded-lg shadow-sm font-poppins font-medium text-xs transition-all duration-150 hover:scale-[1.02] truncate whitespace-nowrap"
                    variant="ghost"
                  >
                    <X className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 stroke-[2.5px]" /> <span className="hidden sm:inline">Decline</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {orderRequests.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-[#F1F0FB] rounded-full">
                  <Package className="h-6 w-6 text-[#9b87f5]" />
                </div>
                <p className="text-gray-500 font-poppins mt-2">No pending order requests</p>
                <p className="text-gray-400 font-poppins text-xs">New orders will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewOrderRequests;
