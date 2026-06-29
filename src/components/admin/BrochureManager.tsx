"use client";

import { useEffect, useRef, useState } from "react";
import { FileDown, Trash2, Upload } from "lucide-react";

import { setProductBrochure } from "@/lib/admin/actions/brochure";
import { useProductEditor, type CommitResult } from "@/components/admin/product-editor-context";
import { uploadFile } from "@/lib/admin/upload";
import { storageUrl } from "@/lib/site";

type Props = { productId: string; brochureUrl: string | null };

/**
 * Brochure (PDF) picker. The chosen file or removal is buffered locally and only
 * uploaded / persisted when the form's Save runs the registered commit.
 */
export function BrochureManager({ productId, brochureUrl }: Props) {
  const { markDirty, registerCommit, unregisterCommit, pending } = useProductEditor();

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the buffer after a save (router.refresh) brings the new saved value.
  useEffect(() => {
    setPendingFile(null);
    setRemoved(false);
  }, [brochureUrl]);

  const changed = pendingFile !== null || (removed && !!brochureUrl);

  const commit = async (): Promise<CommitResult> => {
    if (!changed) return { ok: true };
    if (pendingFile) {
      const uploaded = await uploadFile("brochures", pendingFile);
      if ("error" in uploaded) return { ok: false, error: uploaded.error };
      const result = await setProductBrochure(productId, uploaded.path);
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    }
    const result = await setProductBrochure(productId, null);
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  };

  const commitRef = useRef(commit);
  commitRef.current = commit;
  useEffect(() => {
    registerCommit("brochure", () => commitRef.current());
    return () => unregisterCommit("brochure");
  }, [registerCommit, unregisterCommit]);

  function onSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Brochure must be a PDF file.");
      return;
    }
    setError(null);
    setRemoved(false);
    setPendingFile(file);
    markDirty();
  }

  function onRemove() {
    setPendingFile(null);
    setRemoved(true);
    markDirty();
  }

  // What to show: a pending pick, else the saved brochure (unless cleared).
  const showsCurrent = !pendingFile && !removed && !!brochureUrl;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-slate-900">Brochure (PDF)</h2>
      <div className="mt-3 flex items-center gap-4">
        {pendingFile ? (
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <FileDown className="h-4 w-4 text-brand-700" aria-hidden />
            {pendingFile.name}
            <span className="rounded bg-brand-700 px-1.5 py-0.5 text-[0.625rem] font-semibold text-white">
              New
            </span>
          </p>
        ) : showsCurrent ? (
          <>
            <a
              href={brochureUrl!.startsWith("http") ? brochureUrl! : storageUrl("brochures", brochureUrl!)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              <FileDown className="h-4 w-4" aria-hidden /> View current brochure
            </a>
            <button
              type="button"
              onClick={onRemove}
              disabled={pending}
              className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Remove
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            {removed ? "Brochure will be removed on save." : "No brochure uploaded."}
          </p>
        )}
        <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 aria-disabled:opacity-50">
          <Upload className="h-3.5 w-3.5" aria-hidden />
          {pendingFile || showsCurrent ? "Replace PDF" : "Choose PDF"}
          <input
            type="file"
            accept="application/pdf"
            onChange={onSelect}
            disabled={pending}
            className="hidden"
          />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
