"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Trash2, Wand2 } from "lucide-react";

import {
  CountedInput,
  ConfirmButton,
  Field,
  LocaleTabs,
  inputClass,
  slugify,
} from "@/components/admin/ui";
import {
  deleteProduct,
  saveProduct,
  type ProductPayload,
} from "@/lib/admin/actions/products";

type Translation = ProductPayload["translations"]["en"];
type Fact = { label: string; value: string };

const emptyTranslation: Translation = {
  title: "",
  slug: "",
  body: "",
  seoTitle: "",
  seoDescription: "",
};

export type ProductFormInitial = {
  id: string;
  categoryId: string;
  sortOrder: number;
  published: boolean;
  brochureUrl: string | null;
  translations: { en: Translation; sq: Translation };
  facts: { en: Fact[]; sq: Fact[] };
};

type Props = {
  categories: { id: string; name: string }[];
  initial?: ProductFormInitial;
  /** Rendered below the form on existing products (images + brochure managers). */
  children?: React.ReactNode;
};

export function ProductForm({ categories, initial, children }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [locale, setLocale] = useState<"en" | "sq">("en");

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [translations, setTranslations] = useState({
    en: initial?.translations.en ?? { ...emptyTranslation },
    sq: initial?.translations.sq ?? { ...emptyTranslation },
  });
  const [facts, setFacts] = useState({
    en: initial?.facts.en ?? [],
    sq: initial?.facts.sq ?? [],
  });

  const t = translations[locale];
  const setT = (patch: Partial<Translation>) =>
    setTranslations((prev) => ({ ...prev, [locale]: { ...prev[locale], ...patch } }));

  const localeFacts = facts[locale];
  const setLocaleFacts = (next: Fact[]) =>
    setFacts((prev) => ({ ...prev, [locale]: next }));

  const moveFact = (index: number, delta: number) => {
    const next = [...localeFacts];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setLocaleFacts(next);
  };

  function submit() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveProduct({
        id: initial?.id,
        categoryId,
        sortOrder,
        published,
        brochureUrl: initial?.brochureUrl ?? null,
        translations,
        facts,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      if (!initial) {
        router.push(`/admin/products/${result.id}`);
      } else {
        router.refresh();
      }
    });
  }

  function remove() {
    if (!initial) return;
    startTransition(async () => {
      const result = await deleteProduct(initial.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/products");
    });
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <LocaleTabs locale={locale} onChange={setLocale} />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
            />
            Published
          </label>
        </div>

        <div className="mt-6 space-y-5">
          <Field label={`Title (${locale.toUpperCase()})`}>
            <input
              type="text"
              value={t.title}
              onChange={(e) => setT({ title: e.target.value })}
              className={inputClass}
            />
          </Field>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label={`Slug (${locale.toUpperCase()})`} hint="Lowercase letters, numbers, dashes — part of the page URL.">
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
              onClick={() => setT({ slug: slugify(t.title) })}
              title="Generate from title"
              className="mb-5 inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Wand2 className="h-3.5 w-3.5" aria-hidden /> From title
            </button>
          </div>

          <Field label={`Body (${locale.toUpperCase()})`} hint="Separate paragraphs with a blank line.">
            <textarea
              rows={8}
              value={t.body}
              onChange={(e) => setT({ body: e.target.value })}
              className={inputClass}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort order" hint="Lower numbers appear first.">
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">
          Specifications ({locale.toUpperCase()})
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Shown as the spec table on the product page.
        </p>
        <div className="mt-4 space-y-2">
          {localeFacts.map((fact, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={fact.label}
                placeholder="Label"
                onChange={(e) =>
                  setLocaleFacts(
                    localeFacts.map((f, i) => (i === index ? { ...f, label: e.target.value } : f)),
                  )
                }
                className={`${inputClass} mt-0 flex-1`}
              />
              <input
                type="text"
                value={fact.value}
                placeholder="Value"
                onChange={(e) =>
                  setLocaleFacts(
                    localeFacts.map((f, i) => (i === index ? { ...f, value: e.target.value } : f)),
                  )
                }
                className={`${inputClass} mt-0 flex-1`}
              />
              <button type="button" onClick={() => moveFact(index, -1)} aria-label="Move up" className="p-1.5 text-slate-400 hover:text-brand-700 disabled:opacity-30" disabled={index === 0}>
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => moveFact(index, 1)} aria-label="Move down" className="p-1.5 text-slate-400 hover:text-brand-700 disabled:opacity-30" disabled={index === localeFacts.length - 1}>
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setLocaleFacts(localeFacts.filter((_, i) => i !== index))}
                aria-label="Remove row"
                className="p-1.5 text-slate-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLocaleFacts([...localeFacts, { label: "", value: "" }])}
          className="mt-3 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          + Add row
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">SEO ({locale.toUpperCase()})</h2>
        <div className="mt-4 space-y-5">
          <CountedInput
            label="SEO title"
            max={60}
            value={t.seoTitle}
            onChange={(value) => setT({ seoTitle: value })}
          />
          <CountedInput
            label="SEO description"
            max={160}
            rows={3}
            value={t.seoDescription}
            onChange={(value) => setT({ seoDescription: value })}
          />
        </div>
      </div>

      {children}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-700">Saved — the public site has been updated.</p>}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-md bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
        >
          {pending ? "Saving…" : initial ? "Save changes" : "Create product"}
        </button>
        {initial && <ConfirmButton onConfirm={remove}>Delete product</ConfirmButton>}
      </div>
    </div>
  );
}
