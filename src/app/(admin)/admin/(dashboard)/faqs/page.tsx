import { FaqsManager } from "@/components/admin/FaqsManager";
import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "FAQs — Gergoci Admin" };

export default async function FaqsAdminPage() {
  const { supabase } = await requireEditor();
  const { data: faqs } = await supabase
    .from("faqs")
    .select("id, sort_order, faq_translations(locale, question, answer)")
    .order("sort_order");

  const rows = (faqs ?? []).map((faq) => {
    const find = (locale: "en" | "sq") =>
      faq.faq_translations.find((t) => t.locale === locale) ?? { question: "", answer: "" };
    return {
      id: faq.id,
      sort_order: faq.sort_order,
      translations: {
        en: { question: find("en").question, answer: find("en").answer },
        sq: { question: find("sq").question, answer: find("sq").answer },
      },
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">FAQs</h1>
      <p className="mt-1 text-sm text-slate-500">Shown in the FAQ accordion on the homepage.</p>
      <div className="mt-6">
        <FaqsManager faqs={rows} />
      </div>
    </div>
  );
}
