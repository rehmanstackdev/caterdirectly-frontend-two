import { FormEvent, useRef, useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

interface GuestTicketPaymentFormProps {
  clientSecret: string;
  email: string;
  amount: number;
  onConfirmBackendPayment: (paymentMethodId: string) => Promise<void>;
}

const GuestTicketPaymentForm = ({
  clientSecret,
  email,
  amount,
  onConfirmBackendPayment,
}: GuestTicketPaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [isPaid, setIsPaid] = useState(false);
  const submitLockRef = useRef(false);
  const confirmedIntentIdRef = useRef<string | null>(null);

  const canSubmit = Boolean(
    stripe &&
      elements &&
      firstName.trim() &&
      lastName.trim() &&
      !isSubmitting &&
      !isPaid,
  );

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !canSubmit) return;

    const card = elements.getElement(CardElement);
    if (!card || submitLockRef.current) return;

    const getPaymentMethodId = (intent: any) => {
      return typeof intent?.payment_method === "string"
        ? intent.payment_method
        : intent?.payment_method?.id;
    };

    const finalizeBackendConfirmation = async (intent: any) => {
      if (!intent?.id) {
        throw new Error("Payment succeeded but payment intent ID is missing.");
      }

      const paymentMethodId = getPaymentMethodId(intent);
      if (!paymentMethodId) {
        throw new Error("Payment succeeded but payment method ID is missing.");
      }

      if (confirmedIntentIdRef.current === intent.id) {
        setIsPaid(true);
        return;
      }

      await onConfirmBackendPayment(paymentMethodId);
      confirmedIntentIdRef.current = intent.id;
      setIsPaid(true);
    };

    submitLockRef.current = true;
    setIsSubmitting(true);
    setError("");

    try {
      const existing = await stripe.retrievePaymentIntent(clientSecret);
      if (existing?.paymentIntent?.status === "succeeded") {
        await finalizeBackendConfirmation(existing.paymentIntent);
        return;
      }

      const { error: paymentError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card,
            billing_details: {
              name: `${firstName} ${lastName}`.trim(),
              email,
            },
          },
        });

      if (paymentError) {
        const msg = paymentError.message || "Payment failed. Please try again.";
        const alreadySucceeded =
          paymentError.code === "payment_intent_unexpected_state" ||
          msg.toLowerCase().includes("already succeeded");

        if (alreadySucceeded) {
          const latest = await stripe.retrievePaymentIntent(clientSecret);
          if (latest?.paymentIntent?.status === "succeeded") {
            await finalizeBackendConfirmation(latest.paymentIntent);
            return;
          }
        }

        throw new Error(msg);
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error(
          `Payment status is ${paymentIntent?.status || "unknown"}.`,
        );
      }

      await finalizeBackendConfirmation(paymentIntent);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Payment failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        Payment amount: <span className="font-semibold">{formatAmount(amount)}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            disabled={isSubmitting || isPaid}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            disabled={isSubmitting || isPaid}
          />
        </div>
      </div>

      <div>
        <Label>Card Information</Label>
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: "16px",
                  color: "#111827",
                  "::placeholder": {
                    color: "#9CA3AF",
                  },
                },
                invalid: {
                  color: "#DC2626",
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {isPaid && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Payment successful. Your ticket is confirmed.
        </div>
      )}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-blue-600 text-white hover:bg-blue-700"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : isPaid ? (
          "Payment Completed"
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {formatAmount(amount)}
          </>
        )}
      </Button>
    </form>
  );
};

export default GuestTicketPaymentForm;
