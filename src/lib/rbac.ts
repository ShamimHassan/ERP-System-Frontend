/**
 * rbac.ts — UI-only role helpers.
 *
 * ⚠️  SECURITY NOTE: These helpers control DISPLAY only (show/hide buttons,
 * nav items, form fields). The backend enforces real access control on every
 * API call. Never use these functions as a security boundary.
 */

export type Role = "ADMIN" | "MANAGER" | "MARKETING";

// ── Fine-grained permission checks ────────────────────────────────────────
export const can = {
  // Catalog
  createService:    (role: Role) => role === "ADMIN",
  editProduct:      (role: Role) => role === "ADMIN",
  editPricing:      (role: Role) => role === "ADMIN",

  // Users
  manageUsers:      (role: Role) => role === "ADMIN",
  viewUsers:        (role: Role) => role === "ADMIN" || role === "MANAGER",

  // Quotations
  approveQuote:     (role: Role) => role === "ADMIN" || role === "MANAGER",

  // Customers
  createCustomer:   (role: Role) => role === "ADMIN" || role === "MANAGER",

  // Reports & KPIs
  viewReports:      (role: Role) => role === "ADMIN" || role === "MANAGER",
  setKpiTargets:    (role: Role) => role === "ADMIN" || role === "MANAGER",

  // Audit
  viewAuditLogs:    (role: Role) => role === "ADMIN" || role === "MANAGER",

  // Leads / Opportunities
  createLead:       (_role: Role) => true,  // all roles
  assignLead:       (role: Role) => role === "ADMIN" || role === "MANAGER",

  // Sidebar visibility helpers
  showAdminSection: (role: Role) => role === "ADMIN" || role === "MANAGER",
};

// ── Generic role-list check ───────────────────────────────────────────────
export function hasRole(userRole: Role, allowed: Role[]): boolean {
  return allowed.includes(userRole);
}
