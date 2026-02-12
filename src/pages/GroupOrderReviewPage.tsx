import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";
import GroupOrderReview from "@/components/group-order/GroupOrderReview";
import GuestResponseTracker from "@/components/group-order/GuestResponseTracker";
import { Button } from "@/components/ui/button";
import { Check, Loader } from "lucide-react";
import { useGroupOrder } from "@/contexts/GroupOrderContext";
import { groupOrderService } from "@/services/groupOrderService";
import { toast } from "sonner";
import { GuestOrder as BaseGuestOrder, OrderItem } from "@/types/order";

// Local interface that matches GroupOrderReview component expectations
interface LocalGuestOrder {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  items: OrderItem[];
  status: "pending" | "approved" | "rejected";
  totalAmount: number;
}

const GroupOrderReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [orders, setOrders] = useState<LocalGuestOrder[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  
  // Get orderId from location state
  const { orderId } = location.state || {};
  
  // Set cutoff time 1 hour from now for demo purposes
  const cutoffTime = new Date(new Date().getTime() + 1 * 60 * 60 * 1000);

  // Track loaded order to prevent duplicate API calls
  const loadedOrderRef = useRef<string | null>(null);
  
  // Load order data on mount
  useEffect(() => {
    const loadOrderData = async () => {
      if (!orderId) {
        toast.error('Order ID missing');
        navigate('/group-order/setup');
        return;
      }

      // Prevent duplicate loading
      if (loadedOrderRef.current === orderId) {
        console.log('[GroupOrderReviewPage] Order already loaded, skipping API call');
        return;
      }

      try {
        console.log('[GroupOrderReviewPage] Loading order data for ID:', orderId);
        loadedOrderRef.current = orderId;
        setLoading(true);
        
        // API call replaced with console log
        console.log('[GroupOrderReviewPage] Would fetch group order from API for ID:', orderId);
        const order = null; // Placeholder - API call disabled
        
        // API call disabled - using console logs instead
        if (!order) {
          console.warn('[GroupOrderReviewPage] No order data available (API call disabled)');
          toast.error('Order loading is currently disabled. Please use the API to load order data.');
          setLoading(false);
          return;
        }
        
        // Data processing would happen here if order was loaded
        console.log('[GroupOrderReviewPage] Would process order data:', {
          orderId: orderId,
          guestOrders: 0,
          orderData: null
        });
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error('Failed to load order data');
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [orderId, navigate]);

  const handleApproveOrder = (guestOrderId: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === guestOrderId 
          ? { ...order, status: "approved" } 
          : order
      )
    );
    
    toast.success("Order approved successfully!");
  };

  const handleRejectOrder = (guestOrderId: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === guestOrderId 
          ? { ...order, status: "rejected" } 
          : order
      )
    );
    
    toast.success("Order rejected");
  };

  const handleApproveAll = () => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.status === "pending" 
          ? { ...order, status: "approved" } 
          : order
      )
    );
    
    toast.success("All orders approved!");
  };

  const handleCompleteOrder = async () => {
    if (!orderId) {
      toast.error('Order ID missing');
      return;
    }

    setIsCompleting(true);
    
    try {
      // Update guest orders in database (convert to base guest order format)
      const baseOrders: BaseGuestOrder[] = orders.map(order => ({
        id: order.id,
        name: `${order.firstName} ${order.lastName}`,
        email: order.email,
        items: order.items
      }));
      await groupOrderService.updateGuestOrders(orderId, baseOrders);
      
      // Complete the order
      const success = await groupOrderService.completeGroupOrder(orderId);
      
      if (success) {
        toast.success("Group order completed successfully!");
        navigate('/group-order/summary', {
          state: { orderId }
        });
      } else {
        toast.error('Failed to complete order');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error('Failed to complete order');
    } finally {
      setIsCompleting(false);
    }
  };

  const pendingCount = orders.filter(order => order.status === "pending").length;
  const allApproved = pendingCount === 0;

  if (loading) {
    return (
      <Dashboard activeTab="orders" userRole="event-host">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-[#F07712]" />
            <p className="text-gray-500">Loading order data...</p>
          </div>
        </div>
      </Dashboard>
    );
  }

  if (!orderData) {
    return (
      <Dashboard activeTab="orders" userRole="event-host">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Order not found</p>
            <Button onClick={() => navigate('/group-order/setup')}>
              Go Back to Setup
            </Button>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard activeTab="orders" userRole="event-host">
      <div className="p-6 max-w-[1140px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Review Group Order</h1>
            <p className="text-sm text-gray-500">Order: {orderData.title}</p>
          </div>
          
          <Button
            className="bg-[#F07712] hover:bg-[#F07712]/90"
            disabled={!allApproved || isCompleting}
            onClick={handleCompleteOrder}
          >
            {isCompleting ? (
              "Processing..."
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Complete Group Order
              </>
            )}
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content - Guest orders to approve */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <GroupOrderReview 
                orders={orders} 
                onApproveAll={handleApproveAll}
                onApproveOrder={handleApproveOrder}
                onRejectOrder={handleRejectOrder}
              />
            </div>
          </div>
          
          {/* Sidebar - Order summary and guest response tracker */}
          <div className="space-y-6">
            {/* Guest Response Tracker */}
            <GuestResponseTracker 
              guests={[]} // Will be populated with real invitation data
              cutoffTime={cutoffTime}
            />
            
            {/* Quick Order Summary */}
            <div className="bg-white p-5 rounded-xl shadow-sm space-y-4">
              <h3 className="font-semibold text-lg">Order Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Items:</span>
                  <span className="font-medium">{orders.reduce((acc, order) => acc + order.items.reduce((sum, item) => sum + item.quantity, 0), 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Guest Orders:</span>
                  <span className="font-medium">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pending Approval:</span>
                  <span className="font-medium">{pendingCount}</span>
                </div>
              </div>
              
              <div className="border-t pt-3 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Estimated Total</span>
                  <span>${(
                    orders.filter(order => order.status !== "rejected")
                      .reduce((sum, order) => sum + order.items.reduce((total, item) => total + (item.price * item.quantity), 0), 0) +
                    // Add tax and delivery fee
                    (orders.filter(order => order.status !== "rejected")
                      .reduce((sum, order) => sum + order.items.reduce((total, item) => total + (item.price * item.quantity), 0), 0)) * 0.08 +
                    2.99
                  ).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">*Final total subject to change based on approved orders</p>
              </div>
            </div>
            
            {/* Actions */}
            <Button 
              className="w-full bg-[#F07712] hover:bg-[#F07712]/90"
              disabled={!allApproved || isCompleting}
              onClick={handleCompleteOrder}
            >
              {isCompleting ? "Processing..." : "Complete Group Order"}
            </Button>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

export default GroupOrderReviewPage;