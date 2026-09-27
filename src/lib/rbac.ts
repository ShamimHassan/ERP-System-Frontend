// rbac.ts — UI hints only (backend is the real enforcer).

export type Role = "ADMIN" | "MANAGER" | "MARKETING";

export const can = {
  createService: (role: Role) => role === "ADMIN",
  manageUsers: (role: Role) => role === "ADMIN",
  approveQuote: (role: Role) => role === "ADMIN" || role === "MANAGER",
  viewAuditLogs: (role: Role) => role === "ADMIN" || role === "MANAGER",
  setKpiTargets: (role: Role) => role === "ADMIN" || role === "MANAGER",
  createCustomer: (role: Role) => role === "ADMIN" || role === "MANAGER",
};

export function hasRole(userRole: Role, allowed: Role[]): boolean {
  return allowed.includes(userRole);
}
