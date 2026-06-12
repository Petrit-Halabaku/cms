"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileDown, Trash2, Upload } from "lucide-react";

import { setProductBrochure } from "@/lib/admin/actions/brochure";
import { uploadFile } from "@/lib/admin/upload";
import { storageUrl } from "@/lib/site";

type Props = { productId: string; brochureUrl: string | null };

export function BrochureManager({ productId, brochureUrl }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Brochure must be a PDF file.");
      return;
    }
    setBusy(true);
    setError(null);
    const uploadResult = await uploadFile("brochures", file);
    if ("error" in uploadResult) {
      setError(uploadResult.error);
    } else {
      const result = await setProductBrochure(productId, uploadResult.path);
      if (!result.ok) setError(result.error);
    }
    setBusy(false);
    router.refresh();
  }

  async function onRemove() {
    setBusy(true);
    const result = await setProductBrochure(productId, null);
    if (!result.ok) setError(result.error);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-slate-900">Brochure (PDF)</h2>
      <div className="mt-3 flex items-center gap-4">
        {brochureUrl ? (
          <>
            <a
              href={brochureUrl.startsWith("http") ? brochureUrl : storageUrl("brochures", brochureUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              <FileDown className="h-4 w-4" aria-hidden /> View current brochure
            </a>
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Remove
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500">No brochure uploaded.</p>
        )}
        <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <Upload className="h-3.5 w-3.5" aria-hidden />
          {busy ? "Working…" : brochureUrl ? "Replace PDF" : "Upload PDF"}
          <input
            type="file"
            accept="application/pdf"
            onChange={onUpload}
            disabled={busy}
            className="hidden"
          />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
