"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";

import { ConfirmButton, Field, LocaleTabs, inputClass } from "@/components/admin/ui";
import { deleteFaq, reorderFaqs, saveFaq } from "@/lib/admin/actions/faqs";

export type FaqRow = {
  id: string;
  sort_order: number;
  translations: {
    en: { question: string; answer: string };
    sq: { question: string; answer: string };
  };
};

export function FaqsManager({ faqs }: { faqs: FaqRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok && result.error) setError(result.error);
      router.refresh();
    });
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= faqs.length) return;
    const ids = faqs.map((faq) => faq.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(() => reorderFaqs(ids));
  };

  return (
    <div className="max-w-3xl">
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <FaqCard
            key={faq.id}
            faq={faq}
            disabled={pending}
            onSave={(translations) =>
              run(() => saveFaq({ id: faq.id, sortOrder: faq.sort_order, translations }))
            }
            onDelete={() => run(() => deleteFaq(faq.id))}
            onMoveUp={index > 0 ? () => move(index, -1) : undefined}
            onMoveDown={index < faqs.length - 1 ? () => move(index, 1) : undefined}
          />
        ))}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          run(() =>
            saveFaq({
              sortOrder: faqs.length + 1,
              translations: {
                en: { question: "New question", answer: "Answer" },
                sq: { question: "Pyetje e re", answer: "Përgjigje" },
              },
            }),
          )
        }
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" aria-hidden /> Add FAQ
      </button>
    </div>
  );
}

function FaqCard({
  faq,
  disabled,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  faq: FaqRow;
  disabled: boolean;
  onSave: (translations: FaqRow["translations"]) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [locale, setLocale] = useState<"en" | "sq">("en");
  const [translations, setTranslations] = useState(faq.translations);
  const t = translations[locale];
  const setT = (patch: Partial<{ question: string; answer: string }>) =>
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], ...patch } }));
  const dirty = JSON.stringify(translations) !== JSON.stringify(faq.translations);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <LocaleTabs locale={locale} onChange={setLocale} />
        <div className="flex items-center gap-1">
          <button type="button" onClick={onMoveUp} disabled={disabled || !onMoveUp} aria-label="Move up" className="p-1 text-slate-400 hover:text-brand-700 disabled:opacity-30">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" onClick={onMoveDown} disabled={disabled || !onMoveDown} aria-label="Move down" className="p-1 text-slate-400 hover:text-brand-700 disabled:opacity-30">
            <ArrowDown className="h-4 w-4" />
          </button>
          <ConfirmButton
            onConfirm={onDelete}
            title="Delete FAQ"
            message="The question will be permanently deleted in both languages. This can’t be undone."
          >
            Delete
          </ConfirmButton>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <Field label={`Question (${locale.toUpperCase()})`}>
          <input type="text" value={t.question} onChange={(e) => setT({ question: e.target.value })} className={inputClass} />
        </Field>
        <Field label={`Answer (${locale.toUpperCase()})`}>
          <textarea rows={3} value={t.answer} onChange={(e) => setT({ answer: e.target.value })} className={inputClass} />
        </Field>
      </div>
      {dirty && (
        <button
          type="button"
          onClick={() => onSave(translations)}
          disabled={disabled}
          className="mt-3 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
        >
          Save FAQ
        </button>
      )}
    </div>
  );
}
