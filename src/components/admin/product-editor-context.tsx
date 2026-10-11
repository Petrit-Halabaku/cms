"use client";

import { createContext, useContext } from "react";

export type CommitResult = { ok: true } | { ok: false; error: string };

type ProductEditorCtx = {
  /** Children call this whenever a buffered (unsaved) change is made. */
  markDirty: () => void;
  /**
   * Register a deferred commit. It runs (in registration order) only when the
   * user clicks Save, after the product fields have been saved. Keyed so a
   * component overwrites its own registration on re-render.
   */
  registerCommit: (key: string, fn: () => Promise<CommitResult>) => void;
  unregisterCommit: (key: string) => void;
  /** True while a save is in flight — children disable their controls. */
  pending: boolean;
};

const Ctx = createContext<ProductEditorCtx | null>(null);

export const ProductEditorProvider = Ctx.Provider;

export function useProductEditor(): ProductEditorCtx {
  const value = useContext(Ctx);
  if (!value) throw new Error("useProductEditor must be used within ProductForm");
  return value;
}
