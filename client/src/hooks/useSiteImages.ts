import { trpc } from "@/lib/trpc";

/**
 * Returns the slot -> url map of admin-managed images. While loading or empty,
 * components fall back to gray dimension placeholders.
 */
export function useSiteImages(): Record<string, string> {
  const { data } = trpc.images.publicMap.useQuery(undefined, {
    staleTime: 60_000,
  });
  return data ?? {};
}
