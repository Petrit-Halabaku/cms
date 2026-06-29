import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Pages — Gergoci Admin" };

export default async function PagesAdminPage() {
  const { supabase } = await requireEditor();
  const { data: pages } = await supabase
    .from("pages")
    .select("id, key, page_translations(locale, title), page_sections(id)")
    .order("key");

  const ORDER = ["home", "about", "services", "products", "contact"];
  const sorted = (pages ?? []).sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pages</h1>
      <p className="mt-1 text-sm text-slate-500">
        Edit the content sections, titles and SEO of each page.
      </p>
      <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {sorted.map((page) => {
          const en = page.page_translations.find((t) => t.locale === "en");
          return (
            <Link
              key={page.id}
              href={`/admin/pages/${page.key}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50"
            >
              <div>
                <p className="font-medium text-slate-900">{en?.title ?? page.key}</p>
                <p className="text-xs text-slate-500">
                  {page.page_sections.length} section{page.page_sections.length === 1 ? "" : "s"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
