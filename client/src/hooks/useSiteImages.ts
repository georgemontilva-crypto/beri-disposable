import { trpc } from "@/lib/trpc";

export type PublicMediaEntry = { url: string; mimeType: string | null };

/**
 * Returns a map of slot -> { url, mimeType } for all admin-managed site media.
 * Empty object while loading or if no media has been uploaded.
 */
export function useSiteImages(): Record<string, PublicMediaEntry> {
  const { data } = trpc.images.publicMap.useQuery(undefined, { staleTime: 60_000 });
  return (data as Record<string, PublicMediaEntry>) ?? {};
}
