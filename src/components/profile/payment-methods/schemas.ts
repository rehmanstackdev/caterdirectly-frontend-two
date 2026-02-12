
import { z } from "zod";

export const cardFormSchema = z.object({
  cardholderName: z.string().min(2, "Cardholder name must be at least 2 characters"),
  cardNumber: z.string().min(13, "Card number must be at least 13 digits").max(19, "Card number must not exceed 19 digits"),
  expiryMonth: z.string().min(1, "Please select expiry month"),
  expiryYear: z.string().min(1, "Please select expiry year"),
  cvc: z.string().min(3, "CVC must be at least 3 digits").max(4, "CVC must not exceed 4 digits"),
});

export const netTermsFormSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  taxId: z.string().min(9, "Tax ID must be at least 9 characters"),
  billingEmail: z.string().email("Invalid billing email"),
  billingPhone: z.string().min(10, "Billing phone must be at least 10 characters"),
  paymentTerms: z.enum(["net15", "net30", "net45", "net60"]),
  billingAddress: z.string().min(5, "Billing address must be at least 5 characters"),
  billingCity: z.string().min(2, "Billing city must be at least 2 characters"),
  billingState: z.string().min(2, "Billing state must be at least 2 characters"),
  billingZip: z.string().min(5, "Billing zip must be at least 5 characters"),
  billingCountry: z.string().min(2, "Billing country must be at least 2 characters"),
});
