"use client";

import { useEffect, useState } from "react";

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

/** Destructive button that opens a themed confirmation dialog before firing. */
export function ConfirmButton({
  onConfirm,
  children,
  title = "Are you sure?",
  message = "This can’t be undone.",
  confirmLabel = "Delete",
  className = "",
}: {
  onConfirm: () => void;
  children: React.ReactNode;
  title?: string;
  message?: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-sm font-medium text-red-600 hover:text-red-700 ${className}`}
      >
        {children}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        destructive
        onConfirm={() => {
          setOpen(false);
          onConfirm();
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

/** Themed replacement for window.confirm — overlay dialog matching the admin cards. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${
              destructive ? "bg-red-600 hover:bg-red-700" : "bg-brand-700 hover:bg-brand-800"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
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
