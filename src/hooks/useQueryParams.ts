"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function useQueryParams<T extends Record<string, string>>() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params = Object.fromEntries(searchParams.entries()) as T;

  const setParam = (key: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    if (value) {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    router.push(`?${current.toString()}`);
  };

  const setParams = (updates: Partial<T>) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        current.set(key, value as string);
      } else {
        current.delete(key);
      }
    });
    router.push(`?${current.toString()}`);
  };

  const resetParams = () => {
    router.push("?");
  };

  return { params, setParam, setParams, resetParams };
}
