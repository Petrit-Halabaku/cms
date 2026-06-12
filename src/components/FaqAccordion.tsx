import { ChevronDown } from "lucide-react";

import type { Faq } from "@/lib/db/content";

/** Accessible accordion built on native <details> — no client JS needed. */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {faqs.map((faq) => (
        <details key={faq.id} className="group px-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
            {faq.question}
            <ChevronDown
              className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="pb-5 text-slate-600">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
