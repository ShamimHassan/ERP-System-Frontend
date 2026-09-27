export const LEAD_STATUSES = [
  "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST",
] as const;

export const LEAD_SOURCES = [
  "WEBSITE", "FACEBOOK", "GOOGLE", "PHONE", "EMAIL", "REFERRAL",
  "EXISTING_CUSTOMER", "DIGITAL_MARKETING", "PARTNER", "OTHER",
] as const;

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export const QUOTATION_STATUSES = [
  "DRAFT", "SENT", "VIEWED", "NEGOTIATION", "APPROVED", "REJECTED", "EXPIRED", "CONVERTED",
] as const;

export const ORDER_STATUSES = [
  "DRAFT", "CONFIRMED", "PROCESSING", "COMPLETED", "CANCELLED",
] as const;

export const OPPORTUNITY_STAGES = [
  "QUALIFICATION", "REQUIREMENT_ANALYSIS", "SURVEY", "PROPOSAL",
  "NEGOTIATION", "DECISION", "WON", "LOST",
] as const;

export const SURVEY_STATUSES = ["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"] as const;

export const ACTIVITY_TYPES = [
  "CALL", "MEETING", "FOLLOW_UP", "SURVEY", "EMAIL", "DEMO", "SITE_VISIT", "OTHER",
] as const;

export const CUSTOMER_TYPES = [
  "INDIVIDUAL", "BUSINESS", "CORPORATE", "GOVERNMENT", "PARTNER",
] as const;

export const BILLING_TYPES = ["MONTHLY", "QUARTERLY", "YEARLY", "ONE_TIME"] as const;

export const METRICS = [
  "NEW_LEADS", "QUALIFIED_LEADS", "CALLS", "MEETINGS", "SURVEYS", "FOLLOW_UPS",
  "QUOTATIONS", "WON_DEALS", "NEW_CUSTOMERS", "REVENUE", "COLLECTION", "CONVERSION_RATE",
] as const;

export const PERIOD_TYPES = ["MONTHLY", "QUARTERLY", "YEARLY"] as const;

export const AUDIT_MODULES = [
  "USERS", "LEADS", "CUSTOMERS", "OPPORTUNITIES", "ACTIVITIES", "SURVEYS",
  "PRODUCTS", "PRICES", "QUOTATIONS", "SALES_ORDERS", "KPI_TARGETS",
] as const;

export const AUDIT_ACTIONS = [
  "CREATE", "UPDATE", "DELETE", "ASSIGN", "REASSIGN", "PRICE_CHANGE",
  "DISCOUNT_CHANGE", "PRICE_APPROVAL", "PRICE_APPROVAL_SUBMIT",
  "QUOTATION_APPROVAL", "QUOTATION_REJECTION", "APPROVE", "REJECT",
  "ORDER_CREATE", "ORDER_CANCEL", "STATUS_CHANGE", "CONVERT",
] as const;

// Derived types
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number];
export type SurveyStatus = (typeof SURVEY_STATUSES)[number];
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type CustomerType = (typeof CUSTOMER_TYPES)[number];
export type BillingType = (typeof BILLING_TYPES)[number];
export type Metric = (typeof METRICS)[number];
export type PeriodType = (typeof PERIOD_TYPES)[number];
export type AuditModule = (typeof AUDIT_MODULES)[number];
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
