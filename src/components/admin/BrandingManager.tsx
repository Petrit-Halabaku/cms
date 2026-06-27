"use client";

import { useState } from "react";

import { revalidateBranding } from "@/lib/admin/actions/branding";
import { uploadToPath } from "@/lib/admin/upload";
import { LOGO_PATH, storageUrl } from "@/lib/site";

/**
 * Replace-in-place editor for the single site logo. Uploads the chosen WebP to
 * the fixed `LOGO_PATH`, then revalidates the public site. The preview is
 * cache-busted locally so the editor sees the new file immediately, and is
 * shown on both a light and a dark panel — the two surfaces the logo renders on
 * (header vs. mobile menu / footer, where it's tinted white).
 */
export function BrandingManager({ initialLogoUrl }: { initialLogoUrl: string }) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setError(null);

    const uploaded = await uploadToPath("media", LOGO_PATH, file);
    if ("error" in uploaded) {
      setError(`Upload failed: ${uploaded.error}`);
      setBusy(false);
      return;
    }

    const result = await revalidateBranding();
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }

    setLogoUrl(`${storageUrl("media", LOGO_PATH)}?v=${Date.now()}`);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <figure className="flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-white p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="Current site logo" className="max-h-full max-w-full object-contain" />
          <figcaption className="sr-only">On light surfaces</figcaption>
        </figure>
        <figure className="flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-brand-950 p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt=""
            aria-hidden
            className="max-h-full max-w-full object-contain"
          />
          <figcaption className="sr-only">On dark surfaces (rendered white)</figcaption>
        </figure>
      </div>

      <div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800 aria-disabled:opacity-60">
          {busy ? "Replacing…" : "Replace logo"}
          <input
            type="file"
            accept="image/webp,.webp"
            onChange={onUpload}
            disabled={busy}
            className="hidden"
          />
        </label>
        <p className="mt-2 text-xs text-slate-500">
          WebP only. Replaces the logo across the header, mobile menu, footer and
          search-engine metadata. On dark surfaces it&apos;s tinted white, so a
          single-colour mark works best.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
