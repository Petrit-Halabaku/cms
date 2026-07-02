"use client";

import { useState, useTransition } from "react";

import { SectionEditor } from "@/components/admin/SectionEditor";
import { reorderSections } from "@/lib/admin/actions/pages";

type Content = Record<string, unknown>;

export type SectionData = {
  sectionId: string;
  sectionKey: string;
  type: string;
  initial: { en: Content; sq: Content };
  active: boolean;
};

/**
 * Collapsible, reorderable list of a page's section editors. Reordering is local
 * (no request per click); the new order is persisted once via the "Save order"
 * button, which appears only while the order differs from what's saved.
 */
export function SectionList({
  sections,
  mediaOptions,
  categoryOptions,
}: {
  sections: SectionData[];
  mediaOptions: { id: string; storage_path: string; alt_en: string | null }[];
  categoryOptions: { id: string; name: string }[];
}) {
  const [order, setOrder] = useState(sections);
  const [savedIds, setSavedIds] = useState(() => sections.map((s) => s.sectionId));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const currentIds = order.map((s) => s.sectionId);
  const changed = currentIds.join("|") !== savedIds.join("|");

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  };

  const saveOrder = () => {
    setError(null);
    startTransition(async () => {
      const result = await reorderSections(currentIds);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSavedIds(currentIds);
    });
  };

  const resetOrder = () => {
    const byId = new Map(order.map((s) => [s.sectionId, s]));
    setOrder(savedIds.map((id) => byId.get(id)!).filter(Boolean));
    setError(null);
  };

  return (
    <div className="space-y-4">
      {changed && (
        <div className="sticky top-4 z-30 flex flex-wrap items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          <span className="font-medium">Section order changed — not saved yet.</span>
          <button
            type="button"
            onClick={saveOrder}
            disabled={pending}
            className="rounded-md bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save order"}
          </button>
          <button
            type="button"
            onClick={resetOrder}
            disabled={pending}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Reset
          </button>
          {error && <span className="text-red-600">{error}</span>}
        </div>
      )}

      {order.map((s, i) => (
        <SectionEditor
          key={s.sectionId}
          sectionId={s.sectionId}
          sectionKey={s.sectionKey}
          type={s.type}
          initial={s.initial}
          active={s.active}
          mediaOptions={mediaOptions}
          categoryOptions={categoryOptions}
          onMoveUp={() => move(i, -1)}
          onMoveDown={() => move(i, 1)}
          canMoveUp={i > 0}
          canMoveDown={i < order.length - 1}
        />
      ))}
    </div>
  );
}
