"use client";

import { useState } from "react";

/** Small shared building blocks for admin forms. */

export const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:bg-slate-50";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-900">
      {label}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}
    </label>
  );
}

/** Input with an SEO character counter (green within budget, amber over). */
export function CountedInput({
  label,
  max,
  value,
  onChange,
  rows,
}: {
  label: string;
  max: number;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  const over = value.length > max;
  return (
    <label className="block text-sm font-medium text-slate-900">
      <span className="flex items-center justify-between">
        {label}
        <span className={`text-xs font-normal ${over ? "text-amber-600" : "text-slate-400"}`}>
          {value.length}/{max}
        </span>
      </span>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </label>
  );
}

/** EN | SQ tab switcher used by every translated form. */
export function LocaleTabs({
  locale,
  onChange,
}: {
  locale: "en" | "sq";
  onChange: (locale: "en" | "sq") => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-0.5">
      {(["en", "sq"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`rounded px-4 py-1.5 text-sm font-semibold transition-colors ${
            locale === value ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
          }`}
        >
          {value === "en" ? "English" : "Shqip"}
        </button>
      ))}
    </div>
  );
}

/** Destructive button that asks for an inline confirmation click. */
export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = "Confirm delete?",
  className = "",
}: {
  onConfirm: () => void;
  children: React.ReactNode;
  confirmLabel?: string;
  className?: string;
}) {
  const [arming, setArming] = useState(false);
  if (arming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setArming(false)}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setArming(true)}
      className={`text-sm font-medium text-red-600 hover:text-red-700 ${className}`}
    >
      {children}
    </button>
  );
}

/** Slugify helper for auto-generating slugs from titles. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
