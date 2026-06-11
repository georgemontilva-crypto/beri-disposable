import { useEffect, useRef } from "react";

/**
 * Adds the `in-view` class to elements with the `reveal` class once they enter
 * the viewport, driving CSS entrance transitions. Returns a ref for a container;
 * all descendant `.reveal` elements are observed.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const els = Array.from(container.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el, i) => {
      // optional stagger via inline transition-delay
      const delay = el.dataset.revealDelay;
      if (delay) el.style.transitionDelay = `${delay}ms`;
      else el.style.transitionDelay = `${Math.min(i * 60, 360)}ms`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
