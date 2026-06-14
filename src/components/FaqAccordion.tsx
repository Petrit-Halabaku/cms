import { Plus } from "lucide-react";

import type { Faq } from "@/lib/db/content";

/** Accessible accordion built on native <details> — no client JS needed. */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="border-t border-line">
      {faqs.map((faq) => (
        <details key={faq.id} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-base font-semibold text-slate-900 transition-colors hover:text-brand-700 sm:text-lg [&::-webkit-details-marker]:hidden">
            {faq.question}
            <span className="grid h-8 w-8 shrink-0 place-items-center border border-line text-slate-500 transition-all duration-300 group-open:rotate-45 group-open:border-brand-700 group-open:bg-brand-700 group-open:text-white">
              <Plus className="h-4 w-4" aria-hidden />
            </span>
          </summary>
          <p className="max-w-2xl pb-7 leading-relaxed text-slate-600">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
