import { z } from "zod";

const requiredString = (message: string) =>
  z.string().trim().min(1, message);

const futureOrTodayDate = z
  .string()
  .trim()
  .min(1, "Event date is required")
  .refine((value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, "Event date must be today or in the future");

const positiveGuestCount = z
  .union([z.number(), z.string()])
  .refine((value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 1;
  }, "Guest count must be at least 1");

const emailField = z
  .string()
  .trim()
  .min(1, "Email address is required")
  .email("Please enter a valid email address");

const phoneField = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine((value) => {
    const cleanPhone = value.replace(/[\s\-()]/g, "");
    return /^[+]?[1-9][\d]{7,15}$/.test(cleanPhone);
  }, "Please enter a valid phone number");

export const createEventDetailFormSchema = (isInvoiceMode: boolean) =>
  z.object({
    orderName: requiredString("Event name is required"),
    location: requiredString("Event location is required"),
    date: futureOrTodayDate,
    deliveryWindow: requiredString("Service time is required"),
    headcount: positiveGuestCount,
    primaryContactName: isInvoiceMode
      ? z.string().optional()
      : requiredString("Contact name is required"),
    primaryContactEmail: isInvoiceMode ? z.string().optional() : emailField,
    primaryContactPhone: isInvoiceMode ? z.string().optional() : phoneField,
    clientName: isInvoiceMode
      ? requiredString("Client name is required")
      : z.string().optional(),
    clientEmail: isInvoiceMode ? emailField : z.string().optional(),
    clientPhone: isInvoiceMode ? phoneField : z.string().optional(),
  });

