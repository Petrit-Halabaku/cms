"use server";

import { requireEditor } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import type { ActionResult } from "@/lib/admin/actions/products";

/**
 * Called after the browser upserts a replacement logo to `LOGO_PATH`. The file
 * itself is written client-side under the editor's session (Storage RLS); this
 * just re-checks the caller is an editor and regenerates every page so the new
 * logo (and its fresh cache-bust token) is served.
 */
export async function revalidateBranding(): Promise<ActionResult> {
  await requireEditor();
  await revalidateSite();
  return { ok: true, id: "logo" };
}
