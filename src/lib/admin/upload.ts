"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Browser-side Storage upload (the signed-in editor's own session — storage
 * RLS policies authorize it). Returns the storage path to register via a
 * server action.
 */
export async function uploadFile(
  bucket: "media" | "brochures",
  file: File,
  /** Optional folder prefix within the bucket, e.g. "products/<slug>/gallery". */
  folder?: string,
): Promise<{ path: string } | { error: string }> {
  if (bucket === "media" && file.type !== "image/webp") {
    return { error: "Only WebP images are allowed." };
  }
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const safeBase = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
  const name = `${safeBase}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  const prefix = folder?.replace(/^\/+|\/+$/g, "");
  const path = prefix ? `${prefix}/${name}` : name;

  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) return { error: error.message };
  return { path };
}

/**
 * Upload to a fixed path, overwriting any existing object. Used for singleton
 * brand assets (e.g. the site logo) where the URL must stay stable and callers
 * cache-bust with a version token instead. Same WebP guard and cache lifetime
 * as `uploadFile`.
 */
export async function uploadToPath(
  bucket: "media" | "brochures",
  path: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  if (bucket === "media" && file.type !== "image/webp") {
    return { error: "Only WebP images are allowed." };
  }
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) return { error: error.message };
  return { path };
}

/** Pixel dimensions of an image file (null for non-images / failures). */
export async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith("image/")) return null;
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}
