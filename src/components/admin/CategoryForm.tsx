"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Wand2 } from "lucide-react";

import {
  CountedInput,
  ConfirmButton,
  Field,
  LocaleTabs,
  inputClass,
  slugify,
} from "@/components/admin/ui";
import {
  deleteCategory,
  saveCategory,
  type CategoryPayload,
} from "@/lib/admin/actions/categories";

type Translation = CategoryPayload["translations"]["en"];

const emptyTranslation: Translation = {
  name: "",
  slug: "",
  description: "",
  seoTitle: "",
  seoDescription: "",
};

type Props = {
  initial?: {
    id: string;
    sortOrder: number;
    translations: { en: Translation; sq: Translation };
  };
};

export function CategoryForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [locale, setLocale] = useState<"en" | "sq">("en");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [translations, setTranslations] = useState({
    en: initial?.translations.en ?? { ...emptyTranslation },
    sq: initial?.translations.sq ?? { ...emptyTranslation },
  });

  const t = translations[locale];
  const setT = (patch: Partial<Translation>) =>
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], ...patch } }));

  function submit() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveCategory({ id: initial?.id, sortOrder, translations });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      if (!initial) router.push("/admin/categories");
      else router.refresh();
    });
  }

  function remove() {
    if (!initial) return;
    startTransition(async () => {
      const result = await deleteCategory(initial.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/categories");
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <LocaleTabs locale={locale} onChange={setLocale} />
        <div className="mt-6 space-y-5">
          <Field label={`Name (${locale.toUpperCase()})`}>
            <input
              type="text"
              value={t.name}
              onChange={(e) => setT({ name: e.target.value })}
              className={inputClass}
            />
          </Field>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label={`Slug (${locale.toUpperCase()})`} hint="Part of the category URL.">
                <input
                  type="text"
                  value={t.slug}
                  onChange={(e) => setT({ slug: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => setT({ slug: slugify(t.name) })}
              title="Generate from name"
              className="mb-5 inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Wand2 className="h-3.5 w-3.5" aria-hidden /> From name
            </button>
          </div>
          <Field label={`Description (${locale.toUpperCase()})`}>
            <textarea
              rows={3}
              value={t.description}
              onChange={(e) => setT({ description: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Sort order" hint="Lower numbers appear first.">
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <CountedInput
            label={`SEO title (${locale.toUpperCase()})`}
            max={60}
            value={t.seoTitle}
            onChange={(value) => setT({ seoTitle: value })}
          />
          <CountedInput
            label={`SEO description (${locale.toUpperCase()})`}
            max={160}
            rows={3}
            value={t.seoDescription}
            onChange={(value) => setT({ seoDescription: value })}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-700">Saved — the public site has been updated.</p>}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-md bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {pending ? "Saving…" : initial ? "Save changes" : "Create category"}
        </button>
        {initial && <ConfirmButton onConfirm={remove}>Delete category</ConfirmButton>}
      </div>
    </div>
  );
}
