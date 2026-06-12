import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SubmissionActions } from "@/components/admin/SubmissionActions";
import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Submission — Gergoci Admin" };

type Props = { params: Promise<{ id: string }> };

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
  message: "Message",
  category: "Product category",
  dimensions: "Dimensions",
  quantity: "Quantity",
};

export default async function SubmissionDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireEditor();

  const { data: submission } = await supabase
    .from("form_submissions")
    .select("id, form_type, payload, locale, is_read, is_archived, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!submission) notFound();

  // Opening a submission marks it read.
  if (!submission.is_read) {
    await supabase.from("form_submissions").update({ is_read: true }).eq("id", id);
  }

  const payload = (submission.payload ?? {}) as Record<string, unknown>;
  const known = Object.keys(FIELD_LABELS).filter((key) => payload[key] != null && payload[key] !== "");
  const extra = Object.keys(payload).filter((key) => !(key in FIELD_LABELS));

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to submissions
      </Link>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {String(payload.name ?? "Submission")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {submission.form_type === "quote" ? "Quote request" : "Contact message"} ·{" "}
              {submission.locale.toUpperCase()} ·{" "}
              {new Date(submission.created_at).toLocaleString("en-GB")}
            </p>
          </div>
          <SubmissionActions id={submission.id} isArchived={submission.is_archived} />
        </div>

        <dl className="mt-6 space-y-4">
          {known.map((key) => (
            <div key={key}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {FIELD_LABELS[key]}
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">
                {String(payload[key])}
              </dd>
            </div>
          ))}
          {extra.map((key) => (
            <div key={key}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{key}</dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">
                {String(payload[key])}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
