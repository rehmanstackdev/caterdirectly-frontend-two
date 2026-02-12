import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";
import GroupOrderSummary from "@/components/group-order/GroupOrderSummary";
import { GuestOrder, OrderItem } from "@/types/order";
import { groupOrderService } from "@/services/groupOrderService";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const GroupOrderSummaryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [guestOrders, setGuestOrders] = useState<GuestOrder[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Track loaded order to prevent duplicate API calls
  const loadedOrderRef = useRef<string | null>(null);
  
  // Load order data
  useEffect(() => {
    const loadOrderData = async () => {
      if (!orderId) {
        toast.error('Order ID missing');
        navigate('/group-order/setup');
        return;
      }

      // Prevent duplicate loading
      if (loadedOrderRef.current === orderId) {
        console.log('[GroupOrderSummaryPage] Order already loaded, skipping API call');
        return;
      }

      try {
        console.log('[GroupOrderSummaryPage] Loading order data for ID:', orderId);
        loadedOrderRef.current = orderId;
        setLoading(true);
        
        // API call replaced with console log
        console.log('[GroupOrderSummaryPage] Would fetch group order from API for ID:', orderId);
        const order = null; // Placeholder - API call disabled
        
        // API call disabled - using console logs instead
        if (!order) {
          console.warn('[GroupOrderSummaryPage] No order data available (API call disabled)');
          toast.error('Order loading is currently disabled. Please use the API to load order data.');
          setLoading(false);
          return;
        }
        
        // Data processing would happen here if order was loaded
        console.log('[GroupOrderSummaryPage] Would process order data:', {
          orderId: orderId,
          guestOrders: 0,
          orderItems: 0
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

  const handleConfirmOrder = () => {
    toast.success("Order confirmed! Payment processing would happen here.");
    navigate('/order-confirmation', {
      state: { orderId }
    });
  };

  const handleEditOrder = () => {
    navigate('/group-order/review', {
      state: { orderId }
    });
  };

  if (loading) {
    return (
      <Dashboard activeTab="orders" userRole="event-host">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-[#F07712]" />
            <p className="text-gray-500">Loading order summary...</p>
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
        <h1 className="text-2xl font-bold mb-6">Group Order Summary</h1>
        <GroupOrderSummary
          orderItems={orderItems}
          guestOrders={guestOrders}
          cutoffTime={new Date(Date.now() + 2 * 60 * 60 * 1000)} // 2 hours from now
          paymentMethod="host-pays"
          vendorName={orderData.vendor_name || "Selected Vendor"}
          vendorImage=""
          onConfirmOrder={handleConfirmOrder}
          onEditOrder={handleEditOrder}
        />
      </div>
    </Dashboard>
  );
};

export default GroupOrderSummaryPage;