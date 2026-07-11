"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Trash2, Upload } from "lucide-react";

import {
  addGalleryImage,
  deleteGalleryImage,
  importGalleryFromFolder,
  reorderGallery,
} from "@/lib/admin/actions/gallery";
import { ConfirmDialog } from "@/components/admin/ui";
import { uploadFile } from "@/lib/admin/upload";
import { storageUrl } from "@/lib/site";

type Img = { id: string; path: string; alt: string };

/**
 * Manages the images in an editor-curated gallery (the homepage "Our projects"
 * band). Uploads register a row, deletes remove the row + file, and reordering is
 * local until "Save order" persists it — no request per arrow click.
 */
export function ProjectsGalleryManager({
  gallery,
  folder,
  images,
  folderCount,
}: {
  gallery: string;
  folder: string;
  images: Img[];
  folderCount: number;
}) {
  const [order, setOrder] = useState<Img[]>(images);
  const [savedIds, setSavedIds] = useState(() => images.map((i) => i.id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const currentIds = order.map((i) => i.id);
  const orderChanged = currentIds.join("|") !== savedIds.join("|");

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    for (const file of files) {
      const uploaded = await uploadFile("media", file, folder);
      if ("error" in uploaded) {
        setError(uploaded.error);
        break;
      }
      const res = await addGalleryImage(gallery, uploaded.path, "");
      if (!res.ok) {
        setError(res.error);
        break;
      }
      setOrder((prev) => [...prev, { id: res.id, path: uploaded.path, alt: "" }]);
      setSavedIds((prev) => [...prev, res.id]);
    }
    setBusy(false);
  }

  function remove(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await deleteGalleryImage(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOrder((prev) => prev.filter((i) => i.id !== id));
      setSavedIds((prev) => prev.filter((x) => x !== id));
    });
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  function saveOrder() {
    setError(null);
    startTransition(async () => {
      const res = await reorderGallery(currentIds);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSavedIds(currentIds);
    });
  }

  function resetOrder() {
    const byId = new Map(order.map((i) => [i.id, i]));
    setOrder(savedIds.map((id) => byId.get(id)!).filter(Boolean));
  }

  function importFolder() {
    setError(null);
    startTransition(async () => {
      const res = await importGalleryFromFolder(gallery, folder);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOrder((prev) => [...prev, ...res.created]);
      setSavedIds((prev) => [...prev, ...res.created.map((c) => c.id)]);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 aria-disabled:opacity-60">
          <Upload className="h-4 w-4" aria-hidden />
          {busy ? "Uploading…" : "Upload photos"}
          <input
            type="file"
            accept="image/webp,.webp"
            multiple
            onChange={onUpload}
            disabled={busy}
            className="hidden"
          />
        </label>
        {order.length === 0 && folderCount > 0 && (
          <button
            type="button"
            onClick={importFolder}
            disabled={pending}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Import {folderCount} existing photo{folderCount === 1 ? "" : "s"}
          </button>
        )}
        {orderChanged && (
          <>
            <button
              type="button"
              onClick={saveOrder}
              disabled={pending}
              className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save order"}
            </button>
            <button
              type="button"
              onClick={resetOrder}
              disabled={pending}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Reset
            </button>
          </>
        )}
      </div>

      <p className="text-xs text-slate-500">
        WebP only. Reorder with the arrows, then click “Save order”.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {order.length === 0 ? (
        <p className="text-sm text-slate-500">No project photos yet — upload some above.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {order.map((img, i) => (
            <li
              key={img.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={storageUrl("media", img.path)}
                  alt={img.alt}
                  fill
                  sizes="240px"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move earlier"
                    className="p-1 text-slate-400 hover:text-brand-700 disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === order.length - 1}
                    aria-label="Move later"
                    className="p-1 text-slate-400 hover:text-brand-700 disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4 -rotate-90" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete(img.id)}
                  disabled={pending}
                  aria-label="Delete"
                  className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete image"
        message="The image will be permanently removed from the projects gallery. This can’t be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (pendingDelete) remove(pendingDelete);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
