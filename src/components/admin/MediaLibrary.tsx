"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload, X } from "lucide-react";

import { ConfirmButton, Field, inputClass } from "@/components/admin/ui";
import { createMediaRecord, deleteMedia, updateMediaAlt } from "@/lib/admin/actions/media";
import { getImageDimensions, uploadFile } from "@/lib/admin/upload";
import { storageUrl } from "@/lib/site";

export type MediaRow = {
  id: string;
  storage_path: string;
  alt_en: string | null;
  alt_sq: string | null;
  width: number | null;
  height: number | null;
  mime_type: string | null;
};

export function MediaLibrary({ media }: { media: MediaRow[] }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MediaRow | null>(null);

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    for (const file of files) {
      const uploadResult = await uploadFile("media", file);
      if ("error" in uploadResult) {
        setError(`Upload failed: ${uploadResult.error}`);
        break;
      }
      const size = await getImageDimensions(file);
      const result = await createMediaRecord({
        storagePath: uploadResult.path,
        width: size?.width ?? null,
        height: size?.height ?? null,
        mimeType: file.type,
      });
      if (!result.ok) {
        setError(result.error);
        break;
      }
    }
    setUploading(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{media.length} file(s)</p>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
          <Upload className="h-4 w-4" aria-hidden />
          {uploading ? "Uploading…" : "Upload images"}
          <input type="file" accept="image/webp,.webp" multiple onChange={onUpload} disabled={uploading} className="hidden" />
        </label>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {media.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item)}
            className="group relative aspect-square overflow-hidden rounded-md border border-slate-200 bg-slate-100"
            title={item.alt_en ?? item.storage_path}
          >
            <Image
              src={storageUrl("media", item.storage_path)}
              alt={item.alt_en ?? ""}
              fill
              sizes="200px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>
      {media.length === 0 && (
        <p className="mt-10 text-center text-sm text-slate-500">
          No media yet — upload your first images.
        </p>
      )}

      {selected && (
        <MediaDetail
          key={selected.id}
          media={selected}
          onClose={() => setSelected(null)}
          onChanged={() => {
            setSelected(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function MediaDetail({
  media,
  onClose,
  onChanged,
}: {
  media: MediaRow;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [altEn, setAltEn] = useState(media.alt_en ?? "");
  const [altSq, setAltSq] = useState(media.alt_sq ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveAlt() {
    setBusy(true);
    setError(null);
    const result = await updateMediaAlt(media.id, altEn, altSq);
    setBusy(false);
    if (!result.ok) setError(result.error);
    else onChanged();
  }

  async function remove() {
    setBusy(true);
    setError(null);
    const result = await deleteMedia(media.id);
    setBusy(false);
    if (!result.ok) setError(result.error);
    else onChanged();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Media details</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative mt-4 aspect-video overflow-hidden rounded-md bg-slate-100">
          <Image
            src={storageUrl("media", media.storage_path)}
            alt={media.alt_en ?? ""}
            fill
            sizes="512px"
            className="object-contain"
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {media.storage_path}
          {media.width && media.height ? ` — ${media.width}×${media.height}px` : ""}
        </p>
        <div className="mt-4 space-y-3">
          <Field label="Alt text (EN)">
            <input type="text" value={altEn} onChange={(e) => setAltEn(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Alt text (SQ)">
            <input type="text" value={altSq} onChange={(e) => setAltSq(e.target.value)} className={inputClass} />
          </Field>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={saveAlt}
            disabled={busy}
            className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
          >
            {busy ? "Working…" : "Save alt text"}
          </button>
          <ConfirmButton
            onConfirm={remove}
            title="Delete file"
            message="The file will be permanently deleted from the media library. This can’t be undone."
          >
            Delete file
          </ConfirmButton>
        </div>
      </div>
    </div>
  );
}
