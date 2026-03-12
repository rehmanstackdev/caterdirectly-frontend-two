import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import GuestOrderForm from "@/components/group-order/GuestOrderForm";
import { groupOrderService } from "@/services/groupOrderService";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import EnhancedOrderSummaryCard from "@/components/booking/order-summary/EnhancedOrderSummaryCard";
import { ServiceSelection } from "@/types/order";
import Header from "@/components/cater-directly/Header";
import Footer from "@/components/cater-directly/Footer";

interface TokenData {
  email?: string;
}

interface GuestOrderItem {
  id?: string;
  quantity?: number;
  name?: string;
  menuItemName?: string;
  menuName?: string;
  price?: number;
}

interface InvitationDetailsData {
  host_name?: string;
  hostName?: string;
  contactName?: string;
  hostEmail?: string;
  host_email?: string;
  eventName?: string;
  eventLocation?: string;
  eventDate?: string;
  serviceTime?: string;
  inviteEmail?: string;
  acceptanceStatus?: string;
  guestOrderSubmitted?: boolean;
  guestOrder?: {
    items?: GuestOrderItem[];
    totalPrice?: number;
  } | null;
}

const GroupOrderInvitation = () => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get("token");
  const activeToken = id || tokenFromQuery;

  const [isLoading, setIsLoading] = useState(true);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [orderData, setOrderData] = useState<InvitationDetailsData | null>(
    null,
  );
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [hasSubmittedOrder, setHasSubmittedOrder] = useState(false);
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>(
    [],
  );
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    {},
  );

  const ApiUrl = import.meta.env.VITE_API_URL;
  const API_URL = `${ApiUrl}`;

  useEffect(() => {
    const loadOrderData = async () => {
      if (!activeToken) {
        setIsInvalidToken(true);
        setIsLoading(false);
        return;
      }

      try {
        const invitationDetails =
          await groupOrderService.getInvitationDetails(activeToken);
        if (!invitationDetails) {
          setIsInvalidToken(true);
          setIsLoading(false);
          return;
        }
        setTokenData({ email: invitationDetails.inviteEmail });
        if (
          invitationDetails.acceptanceStatus === "accepted" ||
          invitationDetails.guestOrderSubmitted
        ) {
          setIsAccepted(true);
        }
        if (invitationDetails.guestOrderSubmitted) {
          setHasSubmittedOrder(true);
          setIsSubmissionComplete(true);
        }
        setOrderData(invitationDetails);
      } catch (error) {
        console.error("Error loading order data:", error);
        setIsInvalidToken(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderData();
  }, [activeToken]);

  const handleAcceptInvitation = async () => {
    if (!activeToken) return;
    setIsAccepting(true);
    try {
      const response = await fetch(
        `${API_URL}invoices/accept-invitation?token=${encodeURIComponent(activeToken)}&acceptanceStatus=accepted`,
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to accept invitation");
      }
      setIsAccepted(true);
      toast.success("Invitation accepted. You can now place your order.");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to accept invitation.";
      toast.error(message);
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-[#F07712]" />
          <p className="text-gray-600">Loading invitation</p>
        </div>
      </div>
    );
  }

  if (isInvalidToken || !orderData) {
    return (
      <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-black/10">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold">Invalid or Expired Link</h1>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500">
              The invitation link you're using is either invalid or has expired.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const hostName =
    orderData.host_name ||
    orderData.hostName ||
    orderData.contactName ||
    "Your colleague";
  const hostEmail = orderData.hostEmail || orderData.host_email;
  const showNeedHelpOnRight = isSubmissionComplete || hasSubmittedOrder;
  const needHelpCard = (
    <Card className="border-black/10 shadow-sm">
      <CardContent className="p-5">
        <h2 className="text-lg font-semibold">Need Help?</h2>
        <p className="mt-2 text-sm text-gray-600">
          This invitation was sent by your colleague{" "}
          <span className="font-medium text-gray-800">{hostName}</span>. If you
          have any questions, please contact them directly.
        </p>
        {hostEmail && (
          <p className="mt-3 text-sm text-gray-700">
            <span className="font-medium text-gray-800">Host Email:</span>{" "}
            {hostEmail}
          </p>
        )}
        <p className="mt-4 text-xs text-gray-400 text-center">
          If you didn't expect this invitation, you can ignore it.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with dark background */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          <Header />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 py-8 px-4">
        <div className="mx-auto w-full max-w-[1260px]">
          <div className="grid grid-cols-1 xl:grid-cols-10 gap-4 lg:gap-6 w-full max-w-full overflow-x-hidden">
            <div className="xl:col-span-6">
              <div className="border rounded-xl bg-white p-3 sm:p-4 shadow-sm w-full max-w-full overflow-x-hidden xl:h-[calc(100vh-2rem)] xl:overflow-y-auto no-scrollbar">
                <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-x-hidden xl:pr-2">
                  <Card className="border-black/10 shadow-sm">
                    <CardContent className="p-5">
                      <h2 className="text-lg text-center font-semibold">
                        Accept Invitation
                      </h2>
                      <p className="mt-2 text-sm text-center text-gray-600">
                        Please accept the invitation before placing your order.
                      </p>
                      <Button
                        className="mt-4 w-full bg-[#F07712] hover:bg-[#F07712]/90"
                        onClick={handleAcceptInvitation}
                        disabled={
                          isAccepted || isAccepting || hasSubmittedOrder
                        }
                      >
                        {isAccepted
                          ? "Invitation Accepted"
                          : isAccepting
                            ? "Accepting..."
                            : "Accept Invitation"}
                      </Button>
                    </CardContent>
                  </Card>

                  {hasSubmittedOrder ? (
                    <Card className="border-black/10 shadow-sm">
                      <CardContent className="p-5">
                        <h2 className="text-lg text-center font-semibold">
                          Order Already Submitted
                        </h2>
                        <p className="mt-2 text-sm text-center text-gray-600">
                          We have received your order. No further action is
                          needed.
                        </p>
                      </CardContent>
                    </Card>
                  ) : isAccepted ? (
                    <GuestOrderForm
                      token={activeToken}
                      orderInfo={orderData}
                      guestEmail={tokenData?.email}
                      showInlineSummary={false}
                      infoPortalTargetId="group-order-your-information"
                      onSubmitSuccess={() => {
                        setIsSubmissionComplete(true);
                        setSelectedServices([]);
                        setSelectedItems({});
                      }}
                      onSelectionChange={({
                        selectedServices,
                        selectedItems,
                      }) => {
                        setSelectedServices(selectedServices);
                        setSelectedItems(selectedItems);
                      }}
                    />
                  ) : null}

                  {!showNeedHelpOnRight && needHelpCard}
                </div>
              </div>
            </div>

            <div className="xl:col-span-4">
              <div className="border rounded-xl bg-white p-3 sm:p-4 shadow-sm xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:overflow-y-auto no-scrollbar">
                <div className="pr-1">
                  <Card className="border-black/10 shadow-sm shrink-0">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                            Event Details
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium text-gray-800">
                              Event Name:
                            </span>{" "}
                            {orderData.eventName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium text-gray-800">
                              Location:
                            </span>{" "}
                            {orderData.eventLocation}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg border border-black/10 bg-white p-3">
                          <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">
                            Date
                          </p>
                          <p className="mt-1 font-medium text-gray-800">
                            {orderData.eventDate}
                          </p>
                        </div>
                        <div className="rounded-lg border border-black/10 bg-white p-3">
                          <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">
                            Time
                          </p>
                          <p className="mt-1 font-medium text-gray-800">
                            {orderData.serviceTime}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {isAccepted &&
                    !hasSubmittedOrder &&
                    !isSubmissionComplete && (
                      <div className="mt-4">
                        <EnhancedOrderSummaryCard
                          selectedServices={selectedServices}
                          selectedItems={selectedItems}
                          showCheckoutTaxNote={false}
                          showItemCountFooter={false}
                        />
                      </div>
                    )}

                  <div id="group-order-your-information" className="mt-4" />

                  {showNeedHelpOnRight && (
                    <div className="mt-4">{needHelpCard}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default GroupOrderInvitation;
