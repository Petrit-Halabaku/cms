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
 * Renders a page's section editors as a collapsible, reorderable list. Reordering
 * updates local order immediately and persists the new sort_order via a server
 * action; on failure the previous order is restored.
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
  const [, startTransition] = useTransition();

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const prev = order;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    startTransition(async () => {
      const result = await reorderSections(next.map((s) => s.sectionId));
      if (!result.ok) setOrder(prev);
    });
  };

  return (
    <div className="space-y-4">
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
