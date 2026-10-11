"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";

import { setProductOrder } from "@/lib/admin/actions/products";

export function ProductOrderInput({
  productId,
  title,
  sortOrder,
  totalProducts,
}: {
  productId: string;
  title: string;
  sortOrder: number;
  totalProducts: number;
}) {
  const router = useRouter();
  const statusId = useId();
  const [value, setValue] = useState(String(sortOrder));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  // Keep the field in sync after a save or a refreshed server-side list.
  useEffect(() => setValue(String(sortOrder)), [sortOrder]);

  function save() {
    if (pending || value === String(sortOrder)) return;
    const nextOrder = Number(value);
    if (
      value.trim() === "" ||
      !Number.isInteger(nextOrder) ||
      nextOrder < 1 ||
      nextOrder > totalProducts
    ) {
      setError(`Enter a position between 1 and ${totalProducts}.`);
      return;
    }
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        const result = await setProductOrder(productId, nextOrder);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setValue(String(nextOrder));
        setSaved(true);
        router.refresh();
      } catch {
        setError("Could not save the order. Please try again.");
      }
    });
  }

  return (
    <form
      className="min-w-40"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="flex items-center gap-2">
        <input
          type="number"
          step={1}
          min={1}
          max={totalProducts}
          required
          value={value}
          disabled={pending}
          aria-label={`Position for ${title}`}
          aria-describedby={`product-order-hint ${statusId}`}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
            setSaved(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setValue(String(sortOrder));
              setError(null);
              setSaved(false);
            }
          }}
          className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-sm tabular-nums focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:bg-slate-100"
        />
        <button
          type="submit"
          disabled={pending || value === String(sortOrder)}
          aria-label={`Save order for ${title}`}
          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      <p
        id={statusId}
        role="status"
        className={`mt-1 text-xs ${error ? "text-red-600" : "text-green-700"}`}
      >
        {error || (saved ? "Saved" : "")}
      </p>
    </form>
  );
}
