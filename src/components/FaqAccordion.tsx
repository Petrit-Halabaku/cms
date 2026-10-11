import { Plus } from "lucide-react";

import type { Faq } from "@/lib/db/content";

/**
 * Accessible FAQ accordion on native <details> — no client JS. Styled for the
 * navy FAQ section: white questions, light-blue index, and the brand-blue
 * square open-indicator. The shared `name="faqs"` makes the items mutually
 * exclusive — opening one closes the others.
 */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {faqs.map((faq, i) => (
        <details key={faq.id} name="faqs" className="group relative">
          {/* Accent bar — echoes the window mullion; fills in when the item opens. */}
          <span
            aria-hidden
            className="absolute top-0 left-0 h-full w-0.5 origin-top scale-y-0 bg-brand-700 transition-transform duration-300 group-open:scale-y-100"
          />
          <summary className="flex cursor-pointer list-none items-center gap-5 py-6 pr-1 pl-5 transition-colors hover:bg-white/5 [&::-webkit-details-marker]:hidden">
            <span className="font-serif text-sm tabular-nums text-accent italic">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 font-display text-base text-white transition-colors group-hover:text-accent group-open:text-accent sm:text-lg">
              {faq.question}
            </span>
            {/* Blue square open-indicator — Plus rotates into an × and fills brand blue. */}
            <span className="grid h-8 w-8 shrink-0 place-items-center border border-white/20 text-white/50 transition-all duration-300 group-open:rotate-45 group-open:border-brand-700 group-open:bg-brand-700 group-open:text-white">
              <Plus className="h-4 w-4" aria-hidden />
            </span>
          </summary>
          <p className="max-w-2xl pr-5 pb-7 pl-14 leading-relaxed text-brand-100/80">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
