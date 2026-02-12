
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface GuestOrder {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  items: OrderItem[];
  status: "pending" | "approved" | "rejected";
  totalAmount: number;
}

interface GroupOrderReviewProps {
  orders: GuestOrder[];
  onApproveAll: () => void;
  onApproveOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
}

const GroupOrderReview = ({ 
  orders, 
  onApproveAll, 
  onApproveOrder, 
  onRejectOrder 
}: GroupOrderReviewProps) => {
  const pendingOrders = orders.filter(order => order.status === "pending");
  const approvedOrders = orders.filter(order => order.status === "approved");
  const rejectedOrders = orders.filter(order => order.status === "rejected");
  
  const totalAmount = approvedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Review Guest Orders</h2>
        <Button 
          onClick={onApproveAll}
          className="bg-[#469A7E] hover:bg-[#469A7E]/90"
          disabled={pendingOrders.length === 0}
        >
          Approve All Pending ({pendingOrders.length})
        </Button>
      </div>

      {/* Pending Orders */}
      <div className="space-y-4">
        <h3 className="font-semibold">Pending Orders ({pendingOrders.length})</h3>
        {pendingOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending orders to review</p>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map(order => (
              <Card key={order.id} className="border border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base font-medium">
                      {order.firstName} {order.lastName}
                    </CardTitle>
                    <div className="space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => onRejectOrder(order.id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-[#469A7E] hover:bg-[#469A7E]/90"
                        onClick={() => onApproveOrder(order.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{order.email}</p>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    {order.items.map(item => (
                      <li key={item.id} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-2 border-t flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approved Orders */}
      <div className="space-y-4">
        <h3 className="font-semibold">Approved Orders ({approvedOrders.length})</h3>
        {approvedOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No approved orders yet</p>
        ) : (
          <div className="space-y-3">
            {approvedOrders.map(order => (
              <Card key={order.id} className="border border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base font-medium">
                      {order.firstName} {order.lastName}
                    </CardTitle>
                    <span className="text-[#469A7E] flex items-center gap-1">
                      <Check className="h-4 w-4" /> Approved
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{order.email}</p>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    {order.items.map(item => (
                      <li key={item.id} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-2 border-t flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <Card className="border-t-4 border-t-[#469A7E]">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Guests:</span>
              <span>{orders.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Approved Orders:</span>
              <span>{approvedOrders.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Orders:</span>
              <span>{pendingOrders.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Rejected Orders:</span>
              <span>{rejectedOrders.length}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total Amount:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupOrderReview;
