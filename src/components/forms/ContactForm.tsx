"use client";

import { useActionState } from "react";

import { submitContact, type FormState } from "@/lib/forms/actions";
import type { Locale } from "@/lib/database.types";
import type { Dictionary } from "@/lib/i18n/dictionary";

const inputClass =
  "mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600";

const initialState: FormState = { status: "idle", message: "" };

export function ContactForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [state, action, pending] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="mt-10 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
      >
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="mt-10 space-y-5">
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot — hidden from real users */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-slate-900">
          {dict.form.name} *
        </label>
        <input id="contact-name" name="name" type="text" required className={inputClass} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-900">
            {dict.form.phone} *
          </label>
          <input id="contact-phone" name="phone" type="tel" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-slate-900">
            {dict.form.email}
          </label>
          <input id="contact-email" name="email" type="email" className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-slate-900">
          {dict.form.message} *
        </label>
        <textarea id="contact-message" name="message" rows={5} required className={inputClass} />
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
