"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api-client";
import type { PaginationMeta } from "@/types/api.types";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MARKETING";
  managerId: string | null;
  manager?: { id: string; name: string; email: string; role: string } | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse { data: UserRow[]; meta: PaginationMeta; }

export function useUsers(params: Record<string, unknown> = {}) {
  return useQuery<UsersResponse>({
    queryKey: ["users", params],
    queryFn: async () => {
      const res = await api.get("/users", { params }) as unknown;
      if (Array.isArray(res)) return { data: res as UserRow[], meta: { page: 1, limit: 20, total: (res as UserRow[]).length, totalPages: 1 } };
      return res as UsersResponse;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.post("/users", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created.");
    },
    onError: (err: unknown) => {
      const msg = (err as { message?: string; errorData?: { code?: string } })?.message;
      const code = (err as { errorData?: { code?: string } })?.errorData?.code;
      if (code === "CONFLICT") toast.error("Email already in use.");
      else toast.error(msg ?? "Failed to create user.");
    },
  });
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.patch(`/users/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated.");
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to update user."),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted.");
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to delete user."),
  });
}

export function useSetPassword(id: string) {
  return useMutation({
    mutationFn: (password: string) => api.patch(`/users/${id}`, { password }),
    onSuccess: () => toast.success("Password updated."),
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to set password."),
  });
}
