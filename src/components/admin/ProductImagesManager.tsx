"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Star, Trash2, Upload } from "lucide-react";

import { saveProductImages } from "@/lib/admin/actions/products";
import { useProductEditor, type CommitResult } from "@/components/admin/product-editor-context";
import { ConfirmDialog } from "@/components/admin/ui";
import { getImageDimensions, uploadFile } from "@/lib/admin/upload";
import { storageUrl } from "@/lib/site";

export type ProductImage = {
  id: string;
  sort_order: number;
  is_featured: boolean;
  media: { id: string; storage_path: string; width: number | null; height: number | null } | null;
};

type Item =
  | {
      key: string;
      kind: "existing";
      projectImageId: string;
      previewUrl: string;
    }
  | {
      key: string;
      kind: "new";
      file: File;
      previewUrl: string;
      width: number | null;
      height: number | null;
    };

type Props = { productId: string; slug: string; images: ProductImage[] };

/**
 * Multi-image upload with drag-to-reorder and a featured toggle. All changes are
 * buffered locally (object-URL previews for new files) and nothing touches
 * Supabase until the form's Save runs the registered commit.
 */
export function ProductImagesManager({ productId, slug, images }: Props) {
  const { markDirty, registerCommit, unregisterCommit, pending } = useProductEditor();
  const folder = `products/${slug || productId}/gallery`;

  const initialItems: Item[] = images
    .filter((image) => image.media)
    .map((image) => ({
      key: `e:${image.id}`,
      kind: "existing" as const,
      projectImageId: image.id,
      previewUrl: storageUrl("media", image.media!.storage_path),
    }));
  const initialFeatured = images.find((i) => i.is_featured);

  const [items, setItems] = useState<Item[]>(initialItems);
  const [featuredKey, setFeaturedKey] = useState<string | null>(
    initialFeatured ? `e:${initialFeatured.id}` : (initialItems[0]?.key ?? null),
  );
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const newKey = useRef(0);

  // Revoke object URLs for buffered uploads when they go away / on unmount.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(
    () => () => {
      for (const item of itemsRef.current) {
        if (item.kind === "new") URL.revokeObjectURL(item.previewUrl);
      }
    },
    [],
  );

  // Resync to fresh props after a save (router.refresh) so newly persisted
  // images are no longer treated as buffered "new" files on the next save.
  const signature = images.map((i) => `${i.id}:${i.is_featured ? 1 : 0}`).join(",");
  const prevSignature = useRef(signature);
  useEffect(() => {
    if (prevSignature.current === signature) return;
    prevSignature.current = signature;
    for (const item of itemsRef.current) {
      if (item.kind === "new") URL.revokeObjectURL(item.previewUrl);
    }
    const next: Item[] = images
      .filter((image) => image.media)
      .map((image) => ({
        key: `e:${image.id}`,
        kind: "existing" as const,
        projectImageId: image.id,
        previewUrl: storageUrl("media", image.media!.storage_path),
      }));
    setItems(next);
    const feat = images.find((i) => i.is_featured);
    setFeaturedKey(feat ? `e:${feat.id}` : (next[0]?.key ?? null));
  }, [signature, images]);

  // Deferred commit — uploads new files, then reconciles the DB to this state.
  const commit = async (): Promise<CommitResult> => {
    const payloadItems = [];
    for (const item of items) {
      if (item.kind === "existing") {
        payloadItems.push({ type: "existing" as const, id: item.projectImageId });
      } else {
        const uploaded = await uploadFile("media", item.file, folder);
        if ("error" in uploaded) return { ok: false, error: `Upload failed: ${uploaded.error}` };
        payloadItems.push({
          type: "new" as const,
          storagePath: uploaded.path,
          width: item.width,
          height: item.height,
          mimeType: item.file.type,
        });
      }
    }
    const featuredIndex = items.findIndex((i) => i.key === featuredKey);
    const result = await saveProductImages({ productId, items: payloadItems, featuredIndex });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  };

  const commitRef = useRef(commit);
  commitRef.current = commit;
  useEffect(() => {
    registerCommit("images", () => commitRef.current());
    return () => unregisterCommit("images");
  }, [registerCommit, unregisterCommit]);

  async function onSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    setError(null);
    setWorking(true);

    const added: Item[] = [];
    for (const file of files) {
      if (file.type !== "image/webp") {
        setError("Only WebP images are allowed.");
        continue;
      }
      const size = await getImageDimensions(file);
      added.push({
        key: `n:${newKey.current++}`,
        kind: "new",
        file,
        previewUrl: URL.createObjectURL(file),
        width: size?.width ?? null,
        height: size?.height ?? null,
      });
    }
    setWorking(false);
    if (added.length === 0) return;

    setItems((prev) => [...prev, ...added]);
    // First image ever added becomes featured by default.
    if (!featuredKey) setFeaturedKey(added[0]?.key ?? null);
    markDirty();
  }

  function onDrop(targetIndex: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === targetIndex) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    markDirty();
  }

  function feature(key: string) {
    setFeaturedKey(key);
    markDirty();
  }

  function remove(key: string) {
    const removed = items.find((i) => i.key === key);
    if (removed?.kind === "new") URL.revokeObjectURL(removed.previewUrl);
    const next = items.filter((i) => i.key !== key);
    setItems(next);
    if (featuredKey === key) setFeaturedKey(next[0]?.key ?? null);
    markDirty();
  }

  const disabled = pending || working;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Images</h2>
          <p className="mt-1 text-xs text-slate-500">
            Drag to reorder. The starred image is shown on cards and as the main product photo.
            Changes are saved when you click Save.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 aria-disabled:opacity-50">
          <Upload className="h-3.5 w-3.5" aria-hidden />
          {working ? "Reading…" : "Add images"}
          <input
            type="file"
            accept="image/webp,.webp"
            multiple
            onChange={onSelect}
            disabled={disabled}
            className="hidden"
          />
        </label>
      </div>

      {items.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((image, index) => (
            <li
              key={image.key}
              draggable={!disabled}
              onDragStart={() => (dragIndex.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(index)}
              className={`group relative aspect-square cursor-grab overflow-hidden rounded-md border bg-slate-100 ${
                featuredKey === image.key ? "border-brand-600 ring-1 ring-brand-600" : "border-slate-200"
              }`}
            >
              <Image
                src={image.previewUrl}
                alt=""
                fill
                sizes="160px"
                unoptimized={image.kind === "new"}
                className="object-cover"
              />
              {image.kind === "new" && (
                <span className="absolute right-1.5 top-1.5 rounded bg-brand-700 px-1.5 py-0.5 text-[0.625rem] font-semibold text-white">
                  New
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-slate-900/60 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => feature(image.key)}
                  disabled={disabled}
                  title={featuredKey === image.key ? "Featured image" : "Set as featured"}
                  className={featuredKey === image.key ? "text-yellow-400" : "text-white hover:text-yellow-300"}
                >
                  <Star className="h-4 w-4" fill={featuredKey === image.key ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingRemove(image.key)}
                  disabled={disabled}
                  title="Remove image"
                  className="text-white hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {featuredKey === image.key && (
                <Star
                  className="absolute left-1.5 top-1.5 h-4 w-4 text-yellow-400 drop-shadow"
                  fill="currentColor"
                  aria-label="Featured"
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No images yet.</p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <ConfirmDialog
        open={pendingRemove !== null}
        title="Remove image"
        message="The image will be removed from this product when you save."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (pendingRemove) remove(pendingRemove);
          setPendingRemove(null);
        }}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  );
}
