import { z } from "zod";

export const inviteStartSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Work email address is required")
    .email("Enter a valid email address"),
});

export type InviteStartFormData = z.infer<typeof inviteStartSchema>;

