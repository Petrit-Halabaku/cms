"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { CountedInput, Field, LocaleTabs, inputClass } from "@/components/admin/ui";
import { savePageMeta, type PageMetaPayload } from "@/lib/admin/actions/pages";

type Translation = PageMetaPayload["translations"]["en"];

type Props = {
  pageId: string;
  pageKey: string;
  initial: { en: Translation; sq: Translation };
};

/** Title / slug / SEO editor for one page, per locale. */
export function PageMetaForm({ pageId, pageKey, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [locale, setLocale] = useState<"en" | "sq">("en");
  const [translations, setTranslations] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const t = translations[locale];
  const setT = (patch: Partial<Translation>) => {
    setStatus("idle");
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], ...patch } }));
  };

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await savePageMeta({ pageId, translations });
      if (!result.ok) {
        setStatus("error");
        setError(result.error);
        return;
      }
      setStatus("saved");
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-slate-900">Page title & SEO</h2>
        <LocaleTabs locale={locale} onChange={setLocale} />
      </div>
      <div className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <input type="text" value={t.title} onChange={(e) => setT({ title: e.target.value })} className={inputClass} />
          </Field>
          <Field
            label="Slug"
            hint={pageKey === "home" ? "The homepage has no slug." : "Changing this changes the page URL."}
          >
            <input
              type="text"
              value={t.slug}
              onChange={(e) => setT({ slug: e.target.value })}
              disabled={pageKey === "home"}
              className={inputClass}
            />
          </Field>
        </div>
        <CountedInput label="SEO title" max={60} value={t.seoTitle} onChange={(v) => setT({ seoTitle: v })} />
        <CountedInput label="SEO description" max={160} rows={3} value={t.seoDescription} onChange={(v) => setT({ seoDescription: v })} />
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {status === "saved" && <span className="text-sm text-green-700">Saved</span>}
        {status === "error" && error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
