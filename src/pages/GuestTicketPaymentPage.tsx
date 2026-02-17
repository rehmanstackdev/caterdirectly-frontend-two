import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Download,
  Loader,
  Loader2,
  Mail,
  MapPin,
  Ticket,
  UserRound,
} from "lucide-react";
import StripeProvider from "@/components/order-summary/StripeProvider";
import Header from "@/components/cater-directly/Header";
import Footer from "@/components/cater-directly/Footer";
import { generateTicketPDF } from "@/utils/ticket-pdf-generator";
import { useGuestTicketPayment } from "@/hooks/use-guest-ticket-payment";
import GuestTicketPaymentForm from "@/components/guests/GuestTicketPaymentForm";

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDateTime = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getStatusMeta = (status?: string) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "paid") {
    return {
      label: "Payment: Paid",
      className: "bg-green-100 text-green-800 border-green-200",
    };
  }

  return {
    label: "Payment: Pending",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  };
};
const GuestTicketPaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDownloadingTicket, setIsDownloadingTicket] = useState(false);

  const {
    state,
    error,
    paymentDetails,
    confirmBackendPayment,
  } = useGuestTicketPayment(id);

  const statusMeta = getStatusMeta(paymentDetails?.paymentStatus);
  const isPaid =
    String(paymentDetails?.paymentStatus || "").toLowerCase() === "paid";

  const handleDownloadTicket = async () => {
    if (!paymentDetails) return;

    setIsDownloadingTicket(true);
    try {
      await generateTicketPDF({
        id: paymentDetails.id,
        guestName: paymentDetails.name || "Guest",
        guestEmail: paymentDetails.email || "",
        ticketName: paymentDetails.ticket?.ticketName || "Ticket",
        amount: Number(paymentDetails.ticketPrice || 0),
        paymentStatus: paymentDetails.paymentStatus,
        eventTitle: paymentDetails.event?.title,
        eventStart: paymentDetails.event?.startDateTime,
        eventEnd: paymentDetails.event?.endDateTime,
        venueAddress: paymentDetails.event?.venueAddress,
      });
    } finally {
      setIsDownloadingTicket(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          <Header />
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Ticket Payment
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Review ticket details and complete your payment securely.
              </p>
            </div>

            <Button
              onClick={handleDownloadTicket}
              disabled={!paymentDetails || isDownloadingTicket}
              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isDownloadingTicket ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isDownloadingTicket ? "Downloading..." : "Download Ticket"}
            </Button>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardDescription>
                Verify your details before confirming payment.
              </CardDescription>
              {paymentDetails?.paymentStatus && (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
              )}
            </CardHeader>

            <CardContent className="space-y-6">

              {state === "loading" && (
                <div className="flex flex-col items-center gap-2 py-12">
                  <Loader className="h-8 w-8 animate-spin text-[#F07712]" />
                  <p className="text-gray-500">Preparing secure payment...</p>
                </div>
              )}

              {state === "error" && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error || "Unable to load payment details."}
                </div>
              )}

              {state === "ready" && paymentDetails && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Ticket Details</CardTitle>
                      <CardDescription>
                        Confirm the attendee and event information.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-start gap-2 text-slate-700">
                        <UserRound className="mt-0.5 h-4 w-4 text-slate-500" />
                        <span>{paymentDetails.name}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-700">
                        <Mail className="mt-0.5 h-4 w-4 text-slate-500" />
                        <span>{paymentDetails.email}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-700">
                        <Ticket className="mt-0.5 h-4 w-4 text-slate-500" />
                        <span>
                          {paymentDetails.ticket?.ticketName || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-700">
                        <Calendar className="mt-0.5 h-4 w-4 text-slate-500" />
                        <div>
                          <div>{paymentDetails.event?.title || "N/A"}</div>
                          <div className="text-xs text-slate-500">
                            {formatDateTime(
                              paymentDetails.event?.startDateTime,
                            )}{" "}
                            -{" "}
                            {formatDateTime(paymentDetails.event?.endDateTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-slate-700">
                        <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                        <span>
                          {paymentDetails.event?.venueAddress || "N/A"}
                        </span>
                      </div>

                      <div className={`mt-4 rounded-md border px-3 py-2 ${isPaid ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}`}>
                        <div className={`text-xs font-medium uppercase tracking-wide ${isPaid ? "text-green-700" : "text-blue-700"}`}>
                          {isPaid ? "Total Paid" : "Total Due"}
                        </div>
                        <div className={`text-xl font-bold ${isPaid ? "text-green-900" : "text-blue-900"}`}>
                          {formatAmount(
                            Number(paymentDetails.ticketPrice || 0),
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Method</CardTitle>
                      <CardDescription>
                        Card payment powered by Stripe.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isPaid ? (
                        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                          <img
                            src="/images/gallery/paid.png"
                            alt="Payment completed"
                            className="mx-auto mb-3 h-24 w-24 object-contain"
                          />
                          <p className="text-center">
                            Payment is already completed for this ticket.
                          </p>
                        </div>
                      ) : paymentDetails.clientSecret ? (
                        <StripeProvider
                          clientSecret={paymentDetails.clientSecret}
                        >
                          <GuestTicketPaymentForm
                            clientSecret={paymentDetails.clientSecret}
                            email={paymentDetails.email}
                            amount={Number(paymentDetails.ticketPrice || 0)}
                            onConfirmBackendPayment={confirmBackendPayment}
                          />
                        </StripeProvider>
                      ) : (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                          Payment is not available right now because the payment
                          session is missing.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate("/")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GuestTicketPaymentPage;


