import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** CSV export of all form submissions (editor-only). */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return new NextResponse("Forbidden", { status: 403 });

  const { data: submissions, error } = await supabase
    .from("form_submissions")
    .select("id, form_type, payload, locale, is_read, is_archived, created_at")
    .order("created_at", { ascending: false });
  if (error) return new NextResponse(error.message, { status: 500 });

  const PAYLOAD_KEYS = ["name", "phone", "email", "category", "dimensions", "quantity", "message"];
  const header = ["id", "type", "locale", "created_at", "read", "archived", ...PAYLOAD_KEYS];

  const escape = (value: unknown) => {
    const s = value == null ? "" : String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const rows = (submissions ?? []).map((submission) => {
    const payload = (submission.payload ?? {}) as Record<string, unknown>;
    return [
      submission.id,
      submission.form_type,
      submission.locale,
      submission.created_at,
      submission.is_read,
      submission.is_archived,
      ...PAYLOAD_KEYS.map((key) => payload[key]),
    ]
      .map(escape)
      .join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gergoci-submissions.csv"`,
    },
  });
}
