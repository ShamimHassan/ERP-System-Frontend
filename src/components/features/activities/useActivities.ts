"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api-client";
import type { Activity, PaginationMeta } from "@/types/api.types";

interface ActivitiesResponse { data: Activity[]; meta: PaginationMeta; }

export function useActivities(params: Record<string, unknown>) {
  return useQuery<ActivitiesResponse>({
    queryKey: ["activities", params],
    queryFn: async () => {
      const res = await api.get("/activities", { params }) as unknown;
      if (res && typeof res === "object" && "data" in (res as object) && "meta" in (res as object)) return res as ActivitiesResponse;
      if (Array.isArray(res)) return { data: res as Activity[], meta: { page: 1, limit: 20, total: (res as Activity[]).length, totalPages: 1 } };
      return res as ActivitiesResponse;
    },
    placeholderData: (prev) => prev,
  });
}

export function useActivity(id: string) {
  return useQuery<Activity>({
    queryKey: ["activities", id],
    queryFn: () => api.get(`/activities/${id}`) as unknown as Promise<Activity>,
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.post("/activities", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["activities"] }); toast.success("Activity created."); },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to create activity."),
  });
}
