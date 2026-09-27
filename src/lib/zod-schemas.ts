// zod-schemas.ts — mirror backend validations.
// Fully expanded in Step 7.

import { z } from "zod";
import { LEAD_SOURCES, LEAD_STATUSES, PRIORITIES } from "@/types/enums";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createLeadSchema = z.object({
  leadName: z.string().min(1).max(200),
  companyName: z.string().min(1).max(200),
  phone: z.string().min(1).max(30),
  email: z.string().email().optional().or(z.literal("")),
  leadSource: z.enum(LEAD_SOURCES),
  priority: z.enum(PRIORITIES),
  status: z.enum(LEAD_STATUSES).default("NEW"),
  estimatedValue: z.coerce.number().positive().optional(),
  nextFollowUp: z.string().date().optional(),
  notes: z.string().max(2000).optional(),
  managerId: z.string().uuid().optional(),
  marketingPersonId: z.string().uuid().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
