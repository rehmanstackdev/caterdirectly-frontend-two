
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useOrderSubmission } from "@/hooks/use-order-submission";

const GroupOrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { submitGroupOrder, navigateToConfirmation } = useOrderSubmission();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get data from location state
  const orderInfo = location.state?.orderInfo;
  const services = location.state?.services;
  const guestOrders = location.state?.guestOrders;

  // Validate required data
  useEffect(() => {
    if (!orderInfo || !services) {
      toast.error("Missing order information. Please start over.");
      navigate("/group-order/setup");
    }
  }, [orderInfo, services, navigate]);

  const handleConfirmOrder = async () => {
    if (!orderInfo || !services) {
      toast.error("Missing order information. Please start over.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Use our new order submission hook
      const result = await submitGroupOrder(orderInfo, services, guestOrders);
      
      if (result) {
        toast.success("Group order placed successfully!");
        // Navigate to a thank-you page
        setTimeout(() => {
          navigateToConfirmation(result.id);
        }, 1000);
      }
    } catch (error) {
      console.error("Error submitting group order:", error);
      toast.error("Failed to place group order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dashboard userRole="event-host" activeTab="orders">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Almost Done!</h1>
          <p className="text-xl">
            Your group order is ready to be submitted. Click below to confirm and place your order.
          </p>

          <div className="flex flex-col items-center space-y-4 pt-6">
            <Button
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
              className="bg-[#F07712] hover:bg-[#F07712]/90 text-white px-8 py-6 text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Place Group Order"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/group-order/summary")}
              disabled={isSubmitting}
            >
              Review Order Again
            </Button>
          </div>
        </div>
      </div>
    </Dashboard>
  );
};

export default GroupOrderConfirmationPage;
