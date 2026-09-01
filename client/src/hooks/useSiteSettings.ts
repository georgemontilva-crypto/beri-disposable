import { trpc } from "@/lib/trpc";

/**
 * Site-wide toggles, with the server's defaults already applied.
 * Returns an empty object while loading; callers should treat a missing key as
 * "use the default", never as "off".
 */
export function useSiteSettings(): Record<string, string> {
  const { data } = trpc.settings.publicMap.useQuery(undefined, {
    staleTime: 60_000,
  });
  return data ?? {};
}

/** Reads a boolean setting, defaulting to `fallback` until the query resolves. */
export function useBooleanSetting(key: string, fallback = true): boolean {
  const settings = useSiteSettings();
  const raw = settings[key];
  return raw === undefined ? fallback : raw === "true";
}
