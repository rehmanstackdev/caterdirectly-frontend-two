import { useCallback, useEffect, useState } from "react";
import guestTicketPaymentService, {
  GuestPaymentDetails,
} from "@/services/api/host/guest/guestTicketPayment.service";

export type PaymentState = "loading" | "ready" | "error";

export function useGuestTicketPayment(guestId?: string) {
  const [state, setState] = useState<PaymentState>("loading");
  const [error, setError] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<GuestPaymentDetails | null>(null);

  const loadPaymentDetails = useCallback(async () => {
    if (!guestId) {
      setState("error");
      setError("Invalid payment link.");
      setPaymentDetails(null);
      return;
    }

    setState("loading");
    setError("");

    try {
      const payload = await guestTicketPaymentService.getGuestPaymentDetails(guestId);
      const data = payload?.data ?? payload;

      if (!data?.id) {
        throw new Error("Unable to load guest payment details.");
      }

      setPaymentDetails(data as GuestPaymentDetails);
      setState("ready");
    } catch (err: any) {
      setState("error");
      setPaymentDetails(null);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load payment details.",
      );
    }
  }, [guestId]);

  const confirmBackendPayment = useCallback(
    async (paymentMethodId: string) => {
      if (!guestId) {
        throw new Error("Invalid payment link.");
      }

      await guestTicketPaymentService.confirmGuestPayment(guestId, paymentMethodId);
    },
    [guestId],
  );

  useEffect(() => {
    loadPaymentDetails();
  }, [loadPaymentDetails]);

  return {
    state,
    error,
    paymentDetails,
    loadPaymentDetails,
    confirmBackendPayment,
  };
}
