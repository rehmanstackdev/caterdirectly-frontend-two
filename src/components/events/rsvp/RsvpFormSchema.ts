
import * as z from 'zod';

export const rsvpFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  socialMediaLinkedin: z.string().optional(),
  socialMediaTwitter: z.string().optional(),
  socialMediaWebsite: z.string().optional(),
  response: z.enum(["attending", "not_attending"]),
  ticketTypeId: z.string().optional(),
});

export type RsvpFormValues = z.infer<typeof rsvpFormSchema>;
