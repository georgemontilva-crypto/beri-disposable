/**
 * Expandable explainer under the spec cards.
 *
 * A disclosure rather than a modal: the content is reference material the
 * visitor reads alongside the specs, and a dialog would hide those exact specs
 * behind an overlay just as they're being compared.
 *
 * The open/closed animation uses a grid row from 0fr to 1fr rather than
 * max-height. A max-height has to be guessed, and guessing high makes short
 * panels crawl while guessing low clips long ones; a grid track animates to the
 * content's real height whatever that turns out to be.
 */
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

export default function HowItWorks({
  title,
  items,
  accent,
}: {
  title: string;
  items: { title: string; body: string }[];
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="press group inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-white/10"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id={panelId}
        className="grid transition-[grid-template-rows] duration-500 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        {/* The overflow-hidden child is what the collapsing track clips; the
            content inside keeps its natural height throughout. */}
        <div className="overflow-hidden">
          <div className="mt-6 grid gap-x-8 gap-y-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-2 md:p-8">
            {items.map((item) => (
              <div key={item.title}>
                <h3
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: accent }}
                >
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
