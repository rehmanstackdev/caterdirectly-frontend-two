import { z } from "zod";

export interface GroupOrderData {
  eventName: string;
  address: string;
  date: string;
  time: string;
  budgetPerPerson: string;
  contactName: string;
  phone: string;
  email: string;
}

export const groupOrderSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  address: z.string().min(1, "Event location is required"),
  date: z.string().min(1, "Event date is required"),
  time: z.string().min(1, "Time is required"),
  budgetPerPerson: z.string().optional(),
  contactName: z.string().min(1, "Host name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
});
