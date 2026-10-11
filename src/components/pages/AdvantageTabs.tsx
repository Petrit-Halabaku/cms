"use client";

import { useState } from "react";
// import Link from "next/link";
// import { ArrowUpRight } from "lucide-react";

import { FramedPhoto } from "@/components/pages/editorial";
import type { AdvantagePanel } from "@/data/about";

/** Tabbed "advantage" module — switches the panel (image + copy) on select. */
export function AdvantageTabs({
  tabs,
}: {
  tabs: { label: string; panel: AdvantagePanel }[];
}) {
  const [active, setActive] = useState(0);
  const panel = tabs[active].panel;

  return (
    <div className="mt-10">
      {/* Tab bar */}
      <div role="tablist" aria-label="Our advantages" className="flex flex-wrap gap-x-8 gap-y-2 border-b border-line">
        {tabs.map((tab, i) => {
          const selected = i === active;
          return (
            <button
              key={tab.label}
              role="tab"
              type="button"
              id={`advantage-tab-${i}`}
              aria-selected={selected}
              aria-controls="advantage-panel"
              onClick={() => setActive(i)}
              className={`-mb-px border-b-2 py-3 text-sm font-semibold tracking-wide uppercase transition-colors sm:text-base ${
                selected
                  ? "border-brand-700 text-brand-700"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div
        role="tabpanel"
        id="advantage-panel"
        aria-labelledby={`advantage-tab-${active}`}
        className="mt-8 grid items-center gap-6 lg:grid-cols-2 lg:gap-16"
      >
        <FramedPhoto key={panel.image.path + active} image={panel.image} />

        <div>
          <div className="flex items-start gap-4">
            <span aria-hidden className="mt-2.5 block h-3.5 w-3.5 shrink-0 bg-brand-700 sm:mt-3.5" />
            <h3 className="font-display text-2xl text-slate-900 sm:text-3xl">{panel.heading}</h3>
          </div>
          <p className="mt-4 max-w-xl leading-relaxed text-slate-600 sm:mt-5">{panel.body}</p>
          {/* TODO: enable when project links are ready
          <Link
            href={panel.link.href}
            className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-brand-700 uppercase transition-colors hover:text-brand-800"
          >
            {panel.link.label}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </Link>
          */}
        </div>
      </div>
    </div>
  );
}
