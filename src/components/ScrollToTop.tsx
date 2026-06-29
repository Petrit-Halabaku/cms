"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Minimalist "back to top" control. Reuses the editorial arrow-box idiom — a
 * thin framed square that fills brand on hover (same as the product card) — so
 * it reads as part of the system. Fades in once the user scrolls past the
 * first viewport, and is removed from the tab order while hidden.
 */
export function ScrollToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={label}
      tabIndex={visible ? 0 : -1}
      className={`fixed right-4 bottom-4 z-40 grid h-11 w-11 place-items-center border border-line bg-white/85 text-slate-500 backdrop-blur transition-all duration-300 hover:border-brand-700 hover:bg-brand-700 hover:text-white sm:right-6 sm:bottom-6 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUp className="h-4 w-4" strokeWidth={2} aria-hidden />
    </button>
  );
}
