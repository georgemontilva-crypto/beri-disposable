import { cn } from "@/lib/utils";

/**
 * Legal nicotine warning. Rendered in both the header (top bar) and the footer
 * on every page.
 */
export function NicotineWarning({
  variant = "bar",
  className,
}: {
  variant?: "bar" | "footer";
  className?: string;
}) {
  const text =
    "WARNING: This product contains nicotine. Nicotine is an addictive chemical.";

  if (variant === "footer") {
    return (
      <div
        className={cn(
          "rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-neutral-300",
          className
        )}
      >
        {text}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full bg-neutral-900 text-white",
        className
      )}
    >
      <div className="container py-2 text-center text-[11px] font-semibold uppercase tracking-[0.15em] sm:text-xs">
        {text}
      </div>
    </div>
  );
}
