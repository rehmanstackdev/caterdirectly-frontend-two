
import * as z from 'zod';

// Define schema for social media links
export const socialMediaSchema = z.object({
  facebook: z.string().min(1, { message: "Facebook link is required." }),
  twitter: z.string().min(1, { message: "Twitter link is required." }),
  instagram: z.string().min(1, { message: "Instagram link is required." }),
  linkedin: z.string().min(1, { message: "LinkedIn link is required." })
});

// Define a schema for the TicketType
export const ticketTypeSchema = z.object({
  id: z.string(), // Required field
  name: z.string(), // Required field
  price: z.number(), // Required field
  description: z.string().optional(),
  quantity: z.number().int().optional(),
  sold: z.number().default(0), // Required field with default
});

export const eventFormSchema = z.object({
  title: z.string().min(3, {
    message: "Event title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  venueName: z.string().min(2, {
    message: "Venue name is required.",
  }),
  addressStreet: z.string().min(3, {
    message: "Please enter a valid street address.",
  }),
  addressCity: z.string().min(2, {
    message: "Please enter a valid city.",
  }),
  addressState: z.string().min(2, {
    message: "Please enter a valid state.",
  }),
  addressZip: z.string().optional(),
  addressFull: z.string().min(5, {
    message: "Event address is required.",
  }),
  coordinatesLat: z.number().optional(),
  coordinatesLng: z.number().optional(),
  startDate: z.string().min(1, { message: "Start date is required." }),
  startTime: z.string().min(1, { message: "Start time is required." }),
  endDate: z.string().min(1, { message: "End date is required." }),
  endTime: z.string().min(1, { message: "End time is required." }),
  image: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  isPublic: z.boolean().default(true),
  isTicketed: z.boolean().default(false),
  eventUrl: z.string().url().optional().or(z.literal('')),
  parking: z.string().optional(),
  specialInstructions: z.string().optional(),
  socialMedia: socialMediaSchema,
  ticketTypes: z.array(ticketTypeSchema),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;






