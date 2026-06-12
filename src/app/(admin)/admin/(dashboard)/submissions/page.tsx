import Link from "next/link";
import { Download } from "lucide-react";

import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Submissions — Gergoci Admin" };

type Props = { searchParams: Promise<{ view?: string }> };

export default async function SubmissionsAdminPage({ searchParams }: Props) {
  const { view = "inbox" } = await searchParams;
  const archived = view === "archived";
  const { supabase } = await requireEditor();

  const { data: submissions } = await supabase
    .from("form_submissions")
    .select("id, form_type, payload, locale, is_read, is_archived, created_at")
    .eq("is_archived", archived)
    .order("created_at", { ascending: false });

  const name = (payload: unknown) =>
    typeof payload === "object" && payload !== null && "name" in payload
      ? String((payload as { name: unknown }).name)
      : "—";

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Submissions</h1>
        <a
          href="/admin/submissions/export"
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" aria-hidden /> Export CSV
        </a>
      </div>

      <div className="mt-6 flex gap-1 rounded-md border border-slate-200 bg-slate-100 p-0.5 text-sm font-medium w-fit">
        <Link
          href="/admin/submissions"
          className={`rounded px-4 py-1.5 ${!archived ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}
        >
          Inbox
        </Link>
        <Link
          href="/admin/submissions?view=archived"
          className={`rounded px-4 py-1.5 ${archived ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}
        >
          Archived
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Language</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(submissions ?? []).map((submission) => (
              <tr key={submission.id} className={submission.is_read ? "" : "bg-brand-50/50"}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/submissions/${submission.id}`}
                    className={`hover:text-brand-700 ${submission.is_read ? "text-slate-700" : "font-semibold text-slate-900"}`}
                  >
                    {name(submission.payload)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      submission.form_type === "quote"
                        ? "bg-brand-100 text-brand-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {submission.form_type}
                  </span>
                </td>
                <td className="px-4 py-3 uppercase text-slate-500">{submission.locale}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(submission.created_at).toLocaleString("en-GB")}
                </td>
              </tr>
            ))}
            {(submissions ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  {archived ? "No archived submissions." : "Inbox is empty."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
