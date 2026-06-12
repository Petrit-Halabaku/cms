"use client";

import { useActionState } from "react";

import { submitQuote, type FormState } from "@/lib/forms/actions";
import type { Locale } from "@/lib/database.types";
import type { Dictionary } from "@/lib/i18n/dictionary";

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600";

const initialState: FormState = { status: "idle", message: "" };

type Props = {
  locale: Locale;
  dict: Dictionary;
  categories: { slug: string; name: string }[];
};

export function QuoteForm({ locale, dict, categories }: Props) {
  const [state, action, pending] = useActionState(submitQuote, initialState);

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot — hidden from real users */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="quote-name" className="block text-sm font-medium text-slate-900">
            {dict.form.name} *
          </label>
          <input id="quote-name" name="name" type="text" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="quote-phone" className="block text-sm font-medium text-slate-900">
            {dict.form.phone} *
          </label>
          <input id="quote-phone" name="phone" type="tel" required className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="quote-email" className="block text-sm font-medium text-slate-900">
          {dict.form.email}
        </label>
        <input id="quote-email" name="email" type="email" className={inputClass} />
      </div>
      <div>
        <label htmlFor="quote-category" className="block text-sm font-medium text-slate-900">
          {dict.form.category} *
        </label>
        <select
          id="quote-category"
          name="category"
          required
          defaultValue=""
          className={`${inputClass} bg-white`}
        >
          <option value="" disabled>
            {dict.form.categoryPlaceholder}
          </option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="quote-dimensions" className="block text-sm font-medium text-slate-900">
            {dict.form.dimensions}
          </label>
          <input id="quote-dimensions" name="dimensions" type="text" className={inputClass} />
        </div>
        <div>
          <label htmlFor="quote-quantity" className="block text-sm font-medium text-slate-900">
            {dict.form.quantity}
          </label>
          <input id="quote-quantity" name="quantity" type="number" min={1} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="quote-message" className="block text-sm font-medium text-slate-900">
          {dict.form.message}
        </label>
        <textarea id="quote-message" name="message" rows={5} className={inputClass} />
      </div>
      <p className="text-xs text-slate-500">* {dict.form.requiredHint}</p>
      {state.status === "error" && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
      >
        {pending ? dict.form.sending : dict.form.submit}
      </button>
    </form>
  );
}
