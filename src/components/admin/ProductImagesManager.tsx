"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Star, Trash2, Upload } from "lucide-react";

import {
  addProductImage,
  removeProductImage,
  reorderProductImages,
  setFeaturedImage,
} from "@/lib/admin/actions/products";
import { createMediaRecord } from "@/lib/admin/actions/media";
import { getImageDimensions, uploadFile } from "@/lib/admin/upload";
import { storageUrl } from "@/lib/site";

export type ProductImage = {
  id: string;
  sort_order: number;
  is_featured: boolean;
  media: { id: string; storage_path: string; width: number | null; height: number | null } | null;
};

type Props = { productId: string; images: ProductImage[] };

/** Multi-image upload with drag-to-reorder and a featured toggle. */
export function ProductImagesManager({ productId, images }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const [order, setOrder] = useState(images.map((image) => image.id));

  const sorted = order
    .map((id) => images.find((image) => image.id === id))
    .filter((image): image is ProductImage => Boolean(image));

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
      const mediaResult = await createMediaRecord({
        storagePath: uploadResult.path,
        width: size?.width ?? null,
        height: size?.height ?? null,
        mimeType: file.type,
      });
      if (!mediaResult.ok) {
        setError(mediaResult.error);
        break;
      }
      const linkResult = await addProductImage(productId, mediaResult.id);
      if (!linkResult.ok) {
        setError(linkResult.error);
        break;
      }
    }
    setUploading(false);
    router.refresh();
  }

  function onDrop(targetIndex: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === targetIndex) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(targetIndex, 0, moved);
    setOrder(next);
    startTransition(async () => {
      const result = await reorderProductImages(productId, next);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  function feature(imageId: string) {
    startTransition(async () => {
      const result = await setFeaturedImage(productId, imageId);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  function remove(imageId: string) {
    setOrder((prev) => prev.filter((id) => id !== imageId));
    startTransition(async () => {
      const result = await removeProductImage(imageId, productId);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Images</h2>
          <p className="mt-1 text-xs text-slate-500">
            Drag to reorder. The starred image is shown on cards and as the main product photo.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <Upload className="h-3.5 w-3.5" aria-hidden />
          {uploading ? "Uploading…" : "Upload images"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {sorted.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sorted.map((image, index) => (
            <li
              key={image.id}
              draggable
              onDragStart={() => (dragIndex.current = index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(index)}
              className={`group relative aspect-square cursor-grab overflow-hidden rounded-md border bg-slate-100 ${
                image.is_featured ? "border-brand-600 ring-1 ring-brand-600" : "border-slate-200"
              }`}
            >
              {image.media && (
                <Image
                  src={storageUrl("media", image.media.storage_path)}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-slate-900/60 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => feature(image.id)}
                  disabled={pending}
                  title={image.is_featured ? "Featured image" : "Set as featured"}
                  className={image.is_featured ? "text-yellow-400" : "text-white hover:text-yellow-300"}
                >
                  <Star className="h-4 w-4" fill={image.is_featured ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(image.id)}
                  disabled={pending}
                  title="Remove image"
                  className="text-white hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {image.is_featured && (
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
    </div>
  );
}
