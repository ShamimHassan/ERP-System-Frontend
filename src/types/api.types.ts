// api.types.ts — all backend response types.
// Expanded further in Step 7.

import type {
  LeadStatus, LeadSource, Priority,
  QuotationStatus, OrderStatus, OpportunityStage,
  SurveyStatus, ActivityType, CustomerType, BillingType,
  Metric, PeriodType, AuditModule, AuditAction,
} from "./enums";

// ── Standard envelope ──────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export type Role = "ADMIN" | "MANAGER" | "MARKETING";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  managerId: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ── Lead ───────────────────────────────────────────────────────────────────
export interface Lead {
  id: string;
  leadName: string;
  companyName: string;
  phone: string;
  email?: string;
  address?: string;
  leadSource: LeadSource;
  priority: Priority;
  status: LeadStatus;
  serviceId?: string;
  service?: Pick<Service, "id" | "name">;
  categoryId?: string;
  category?: Pick<Category, "id" | "name">;
  productId?: string;
  product?: Pick<Product, "id" | "name">;
  estimatedValue?: number;
  nextFollowUp?: string;
  notes?: string;
  managerId?: string;
  marketingPersonId?: string;
  marketingPerson?: Pick<User, "id" | "name">;
  manager?: Pick<User, "id" | "name">;
  createdAt: string;
  updatedAt: string;
}

// ── Customer ───────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  customerType: CustomerType;
  companyName?: string | null;
  contactPerson: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  billingAddress?: string | null;
  taxVatNo?: string | null;
  status: "ACTIVE" | "INACTIVE";
  convertedFromLeadId?: string | null;
  managerId?: string;
  manager?: Pick<User, "id" | "name" | "email">;
  marketingPersonId?: string;
  marketingPerson?: Pick<User, "id" | "name" | "email">;
  createdAt: string;
  updatedAt: string;
}

// ── Opportunity ────────────────────────────────────────────────────────────
export interface Opportunity {
  id: string;
  name: string;
  leadId?: string | null;
  lead?: { id: string; leadName: string; companyName: string } | null;
  customerId?: string | null;
  customer?: { id: string; companyName?: string | null; contactPerson: string } | null;
  serviceId?: string | null;
  service?: Pick<Service, "id" | "name"> | null;
  categoryId?: string | null;
  category?: Pick<Category, "id" | "name"> | null;
  productId?: string | null;
  product?: Pick<Product, "id" | "name"> | null;
  stage: OpportunityStage;
  estimatedValue?: number | null;
  expectedClosingDate?: string | null;
  notes?: string | null;
  managerId?: string;
  manager?: Pick<User, "id" | "name" | "email"> | null;
  marketingPersonId?: string;
  marketingPerson?: Pick<User, "id" | "name" | "email"> | null;
  createdAt: string;
  updatedAt: string;
}

// ── Activity ───────────────────────────────────────────────────────────────
export type ActivityRelatedType = "LEAD" | "CUSTOMER" | "OPPORTUNITY";

export interface Activity {
  id: string;
  relatedType: ActivityRelatedType;
  relatedId: string;
  assignedUserId?: string | null;
  assignedUser?: Pick<User, "id" | "name" | "email" | "role"> | null;
  type: ActivityType;
  activityDate: string;
  activityTime?: string | null;
  outcome?: string | null;
  nextFollowUp?: string | null;
  notes?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

// ── Survey ─────────────────────────────────────────────────────────────────
export interface Survey {
  id: string;
  opportunityId: string;
  opportunity?: { id: string; name: string; stage: string } | null;
  customerId?: string | null;
  customer?: { id: string; companyName?: string | null; contactPerson: string } | null;
  leadId?: string | null;
  lead?: { id: string; leadName: string; companyName: string } | null;
  serviceId?: string | null;
  service?: Pick<Service, "id" | "name"> | null;
  productId?: string | null;
  product?: Pick<Product, "id" | "name"> | null;
  location: string;
  requirement: string;
  technicalRequirement?: string | null;
  quantity?: number | null;
  budget?: number | null;
  surveyDate: string;
  assignedPersonId?: string | null;
  assignedPerson?: Pick<User, "id" | "name" | "email" | "role"> | null;
  result?: string | null;
  notes?: string | null;
  attachments?: Record<string, unknown> | null;
  status: SurveyStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Catalog ────────────────────────────────────────────────────────────────
export interface CatalogService {
  id: string;
  name: string;
  description?: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  service?: Pick<CatalogService, "id" | "name"> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  unit: string;
  status: "ACTIVE" | "INACTIVE";
  category?: {
    id: string;
    name: string;
    service?: Pick<CatalogService, "id" | "name"> | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export type BillingType = "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONE_TIME";

export interface ProductPrice {
  id: string;
  productId: string;
  regularPrice: number;
  sellingPrice: number;
  minimumPrice: number;
  billingType: BillingType;
  effectiveDate: string;
  status: "ACTIVE" | "INACTIVE";
  createdBy?: Pick<User, "id" | "name" | "email"> | null;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  id: string;
  productPriceId: string;
  oldPrice: number;
  newPrice: number;
  changedAt: string;
  changedBy?: Pick<User, "id" | "name" | "email"> | null;
}

// Keep backward compat alias
export type Service = CatalogService;
export type Price = ProductPrice;

// ── Quotation ──────────────────────────────────────────────────────────────
export interface QuotationItem {
  id: string;
  productId: string;
  product?: Pick<Product, "id" | "name">;
  unitPrice: number;
  quantity: number;
  discount: number;
  tax: number;
  lineTotal: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer?: Pick<Customer, "id" | "name">;
  opportunityId?: string;
  status: QuotationStatus;
  date: string;
  expiryDate?: string;
  paymentTerms?: string;
  notes?: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  items: QuotationItem[];
  marketingPersonId?: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Order ──────────────────────────────────────────────────────────────────
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Pick<Customer, "id" | "name">;
  quotationId?: string;
  status: OrderStatus;
  grandTotal: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── KPI ────────────────────────────────────────────────────────────────────
export interface KpiRow {
  userId: string;
  userName: string;
  periodType: PeriodType;
  periodStart: string;
  periodEnd: string;
  metric: Metric;
  targetValue: number;
  actualValue: number;
  achievementPct: number;
}

// ── Audit Log ──────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  createdAt: string;
  ipAddress?: string;
  actor: Pick<User, "id" | "name" | "email" | "role">;
  module: AuditModule;
  action: AuditAction;
  entityId: string;
  entityLabel: string;
  summary: string;
  details: {
    old: Record<string, unknown>;
    new: Record<string, unknown>;
    changed?: Array<{ field: string; old: unknown; new: unknown }>;
  };
  relatedUser?: Pick<User, "id" | "name" | "role">;
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export interface DashboardSummary {
  role: Role;
  counts: {
    leads: number;
    customers: number;
    opportunities: number;
    quotations: number;
    quotationsApproved: number;
    orders: number;
    ordersCompleted: number;
  };
  revenueYtd: number;
  collectionYtd: number;
  conversionRate: number;
  upcomingActivities: Activity[];
  myTarget?: number;
  myAchievement?: number;
  teamAggs?: {
    totalRevenue: number;
    totalLeads: number;
    topPerformers: User[];
  };
}

export interface MemberRow {
  userId: string;
  userName: string;
  userEmail: string;
  role: Role;
  leads: number;
  opportunities: number;
  quotationsApproved: number;
  ordersCompleted: number;
  newCustomers: number;
  revenueYtd: number;
  target: number;
  achievementPct: number;
  conversionRate: number;
}

export interface TeamPerformance {
  grouped: boolean;
  rows?: MemberRow[];
  managerGroups?: Array<{
    managerId: string;
    managerName: string;
    members: MemberRow[];
  }>;
  orphanMembers?: MemberRow[];
}
