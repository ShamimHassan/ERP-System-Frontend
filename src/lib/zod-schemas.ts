/**
 * zod-schemas.ts — mirrors backend Zod validation schemas.
 *
 * These are used with React Hook Form (@hookform/resolvers/zod) on the
 * frontend. Keep them in sync with the backend — field names, lengths,
 * and enum values must match exactly so RHF errors map to the right fields.
 */

import { z } from "zod";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  PRIORITIES,
  QUOTATION_STATUSES,
  ORDER_STATUSES,
  OPPORTUNITY_STAGES,
  SURVEY_STATUSES,
  ACTIVITY_TYPES,
  CUSTOMER_TYPES,
  BILLING_TYPES,
  METRICS,
  PERIOD_TYPES,
} from "@/types/enums";

// ── Auth ──────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    oldPassword:     z.string().min(1, "Current password required"),
    newPassword:     z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Lead ──────────────────────────────────────────────────────────────────
export const createLeadSchema = z.object({
  leadName:          z.string().min(1, "Lead name is required").max(200),
  companyName:       z.string().min(1, "Company name is required").max(200),
  phone:             z.string().min(1, "Phone is required").max(30),
  email:             z.string().email("Enter a valid email").optional().or(z.literal("")),
  leadSource:        z.enum(LEAD_SOURCES, { required_error: "Select a source" }),
  priority:          z.enum(PRIORITIES, { required_error: "Select a priority" }),
  status:            z.enum(LEAD_STATUSES).default("NEW"),
  estimatedValue:    z.coerce.number().positive("Must be positive").optional(),
  nextFollowUp:      z.string().date("Enter a valid date").optional().or(z.literal("")),
  notes:             z.string().max(2000).optional(),
  // Auto-set by backend for MARKETING role; available for ADMIN/MANAGER
  managerId:         z.string().uuid().optional(),
  marketingPersonId: z.string().uuid().optional(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  status: z.enum(LEAD_STATUSES).optional(),
});

// ── Customer ──────────────────────────────────────────────────────────────
export const createCustomerSchema = z.object({
  name:              z.string().min(1, "Name is required").max(200),
  company:           z.string().min(1, "Company is required").max(200),
  phone:             z.string().min(1, "Phone is required").max(30),
  email:             z.string().email("Enter a valid email").optional().or(z.literal("")),
  type:              z.enum(CUSTOMER_TYPES, { required_error: "Select customer type" }),
  address:           z.string().max(500).optional(),
  notes:             z.string().max(2000).optional(),
  managerId:         z.string().uuid().optional(),
  marketingPersonId: z.string().uuid().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// ── Opportunity ───────────────────────────────────────────────────────────
export const createOpportunitySchema = z.object({
  title:             z.string().min(1, "Title is required").max(200),
  customerId:        z.string().uuid("Select a customer"),
  stage:             z.enum(OPPORTUNITY_STAGES).default("QUALIFICATION"),
  value:             z.coerce.number().positive("Must be positive").optional(),
  probability:       z.coerce.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().date("Enter a valid date").optional().or(z.literal("")),
  notes:             z.string().max(2000).optional(),
  managerId:         z.string().uuid().optional(),
  marketingPersonId: z.string().uuid().optional(),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

// ── Activity ──────────────────────────────────────────────────────────────
export const createActivitySchema = z.object({
  type:            z.enum(ACTIVITY_TYPES, { required_error: "Select activity type" }),
  subject:         z.string().min(1, "Subject is required").max(200),
  description:     z.string().max(2000).optional(),
  scheduledAt:     z.string().datetime({ offset: true }).optional().or(z.literal("")),
  leadId:          z.string().uuid().optional(),
  customerId:      z.string().uuid().optional(),
  opportunityId:   z.string().uuid().optional(),
});

export const updateActivitySchema = createActivitySchema.partial();

// ── Survey ────────────────────────────────────────────────────────────────
export const createSurveySchema = z.object({
  title:            z.string().min(1, "Title is required").max(200),
  status:           z.enum(SURVEY_STATUSES).default("PENDING"),
  customerId:       z.string().uuid().optional(),
  opportunityId:    z.string().uuid().optional(),
  surveyDate:       z.string().date("Enter a valid date").optional().or(z.literal("")),
  notes:            z.string().max(2000).optional(),
  assignedPersonId: z.string().uuid().optional(),
});

export const updateSurveySchema = createSurveySchema.partial();

// ── Quotation ─────────────────────────────────────────────────────────────
export const quotationItemSchema = z.object({
  productId:  z.string().uuid("Select a product"),
  unitPrice:  z.coerce.number().nonnegative("Must be ≥ 0"),
  quantity:   z.coerce.number().int().positive("Must be at least 1"),
  discount:   z.coerce.number().min(0).max(100).default(0),
  tax:        z.coerce.number().min(0).max(100).default(0),
});

export const createQuotationSchema = z.object({
  customerId:    z.string().uuid("Select a customer"),
  opportunityId: z.string().uuid().optional(),
  date:          z.string().date("Enter a valid date"),
  expiryDate:    z.string().date("Enter a valid date").optional().or(z.literal("")),
  paymentTerms:  z.string().max(200).optional(),
  notes:         z.string().max(2000).optional(),
  items:         z.array(quotationItemSchema).min(1, "Add at least one item"),
});

export const updateQuotationSchema = createQuotationSchema.partial().extend({
  status: z.enum(QUOTATION_STATUSES).optional(),
});

export const approveQuotationSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  notes:  z.string().max(500).optional(),
});

// ── Order ─────────────────────────────────────────────────────────────────
export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  notes:  z.string().max(500).optional(),
});

// ── Catalog: Service ──────────────────────────────────────────────────────
export const createServiceSchema = z.object({
  name:        z.string().min(1, "Name is required").max(200),
  description: z.string().max(500).optional(),
  categoryId:  z.string().uuid().optional(),
});

// ── Catalog: Category ─────────────────────────────────────────────────────
export const createCategorySchema = z.object({
  name:        z.string().min(1, "Name is required").max(200),
  description: z.string().max(500).optional(),
});

// ── Catalog: Product ──────────────────────────────────────────────────────
export const createProductSchema = z.object({
  name:        z.string().min(1, "Name is required").max(200),
  description: z.string().max(500).optional(),
  serviceId:   z.string().uuid().optional(),
  billingType: z.enum(BILLING_TYPES, { required_error: "Select billing type" }),
});

// ── Catalog: Price ────────────────────────────────────────────────────────
export const createPriceSchema = z.object({
  productId:     z.string().uuid("Select a product"),
  sellingPrice:  z.coerce.number().nonnegative("Must be ≥ 0"),
  minimumPrice:  z.coerce.number().nonnegative("Must be ≥ 0"),
  effectiveFrom: z.string().date("Enter a valid date"),
  effectiveTo:   z.string().date("Enter a valid date").optional().or(z.literal("")),
}).refine(
  (d) => d.sellingPrice >= d.minimumPrice,
  { message: "Selling price must be ≥ minimum price", path: ["sellingPrice"] }
);

// ── KPI Target ────────────────────────────────────────────────────────────
export const createKpiTargetSchema = z.object({
  userId:      z.string().uuid("Select a user"),
  metric:      z.enum(METRICS, { required_error: "Select a metric" }),
  periodType:  z.enum(PERIOD_TYPES, { required_error: "Select a period type" }),
  periodStart: z.string().date("Enter a valid date"),
  targetValue: z.coerce.number().positive("Must be positive"),
});

// ── User management ───────────────────────────────────────────────────────
export const createUserSchema = z.object({
  name:      z.string().min(1, "Name is required").max(200),
  email:     z.string().email("Enter a valid email"),
  role:      z.enum(["ADMIN", "MANAGER", "MARKETING"] as const),
  managerId: z.string().uuid().optional(),
  password:  z.string().min(8, "At least 8 characters"),
});

export const setPasswordSchema = z
  .object({
    newPassword:     z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Inferred types ────────────────────────────────────────────────────────
export type LoginFormData            = z.infer<typeof loginSchema>;
export type ChangePasswordFormData   = z.infer<typeof changePasswordSchema>;
export type CreateLeadFormData       = z.infer<typeof createLeadSchema>;
export type UpdateLeadFormData       = z.infer<typeof updateLeadSchema>;
export type CreateCustomerFormData   = z.infer<typeof createCustomerSchema>;
export type CreateOpportunityFormData= z.infer<typeof createOpportunitySchema>;
export type CreateActivityFormData   = z.infer<typeof createActivitySchema>;
export type CreateSurveyFormData     = z.infer<typeof createSurveySchema>;
export type CreateQuotationFormData  = z.infer<typeof createQuotationSchema>;
export type QuotationItemFormData    = z.infer<typeof quotationItemSchema>;
export type CreateServiceFormData    = z.infer<typeof createServiceSchema>;
export type CreateProductFormData    = z.infer<typeof createProductSchema>;
export type CreatePriceFormData      = z.infer<typeof createPriceSchema>;
export type CreateKpiTargetFormData  = z.infer<typeof createKpiTargetSchema>;
export type CreateUserFormData       = z.infer<typeof createUserSchema>;
export type SetPasswordFormData      = z.infer<typeof setPasswordSchema>;
