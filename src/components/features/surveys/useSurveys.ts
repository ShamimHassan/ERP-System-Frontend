"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api-client";
import type { Survey, PaginationMeta } from "@/types/api.types";

interface SurveysResponse { data: Survey[]; meta: PaginationMeta; }

export function useSurveys(params: Record<string, unknown>) {
  return useQuery<SurveysResponse>({
    queryKey: ["surveys", params],
    queryFn: async () => {
      const res = await api.get("/surveys", { params }) as unknown;
      if (Array.isArray(res)) return { data: res as Survey[], meta: { page: 1, limit: 20, total: (res as Survey[]).length, totalPages: 1 } };
      return res as SurveysResponse;
    },
    placeholderData: (prev) => prev,
  });
}

export function useSurvey(id: string) {
  return useQuery<Survey>({
    queryKey: ["surveys", id],
    queryFn: () => api.get(`/surveys/${id}`) as unknown as Promise<Survey>,
    enabled: !!id,
    retry: (count, err: unknown) => {
      if ((err as { response?: { status?: number } })?.response?.status === 404) return false;
      return count < 1;
    },
  });
}

export function useCreateSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.post("/surveys", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["surveys"] }); toast.success("Survey created."); },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to create survey."),
  });
}

export function useUpdateSurvey(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.patch(`/surveys/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["surveys"] });
      qc.invalidateQueries({ queryKey: ["surveys", id] });
      toast.success("Survey updated.");
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to update survey."),
  });
}
