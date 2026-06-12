"use server";

import { requireEditor } from "@/lib/admin/auth";
import type { ActionResult } from "@/lib/admin/actions/products";

export async function setSubmissionRead(id: string, isRead: boolean): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const { error } = await supabase
    .from("form_submissions")
    .update({ is_read: isRead })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, id };
}

export async function setSubmissionArchived(
  id: string,
  isArchived: boolean,
): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const { error } = await supabase
    .from("form_submissions")
    .update({ is_archived: isArchived, is_read: true })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, id };
}
