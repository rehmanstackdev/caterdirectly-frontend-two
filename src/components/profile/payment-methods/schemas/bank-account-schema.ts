
import { z } from "zod";

export const bankAccountFormSchema = z.object({
  accountName: z.string().min(2, "Account name must be at least 2 characters"),
  bankName: z.string().min(2, "Bank name must be at least 2 characters"),
  accountType: z.enum(["checking", "savings"]),
  routingNumber: z.string().min(9, "Routing number must be 9 digits"),
  accountNumber: z.string().min(4, "Account number must be at least 4 digits"),
});

