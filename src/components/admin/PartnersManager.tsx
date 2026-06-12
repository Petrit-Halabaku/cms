"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Upload } from "lucide-react";

import { ConfirmButton, inputClass } from "@/components/admin/ui";
import { createMediaRecord } from "@/lib/admin/actions/media";
import {
  deletePartner,
  reorderPartners,
  savePartner,
} from "@/lib/admin/actions/partners";
import { getImageDimensions, uploadFile } from "@/lib/admin/upload";
import { storageUrl } from "@/lib/site";

export type PartnerRow = {
  id: string;
  name: string;
  url: string | null;
  sort_order: number;
  logo: { id: string; storage_path: string } | null;
};

export function PartnersManager({ partners }: { partners: PartnerRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok && result.error) setError(result.error);
      router.refresh();
    });
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= partners.length) return;
    const ids = partners.map((p) => p.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(() => reorderPartners(ids));
  };

  async function uploadLogo(partner: PartnerRow, file: File) {
    setError(null);
    const uploadResult = await uploadFile("media", file);
    if ("error" in uploadResult) {
      setError(uploadResult.error);
      return;
    }
    const size = await getImageDimensions(file);
    const mediaResult = await createMediaRecord({
      storagePath: uploadResult.path,
      width: size?.width ?? null,
      height: size?.height ?? null,
      mimeType: file.type,
      altEn: `${partner.name} logo`,
    });
    if (!mediaResult.ok) {
      setError(mediaResult.error);
      return;
    }
    run(() =>
      savePartner({
        id: partner.id,
        name: partner.name,
        url: partner.url,
        logoMediaId: mediaResult.id,
        sortOrder: partner.sort_order,
      }),
    );
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {partners.map((partner, index) => (
          <li key={partner.id} className="flex items-center gap-4 px-4 py-3">
            <div className="relative flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-50">
              {partner.logo ? (
                <Image
                  src={storageUrl("media", partner.logo.storage_path)}
                  alt={`${partner.name} logo`}
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              ) : (
                <span className="text-[10px] text-slate-400">no logo</span>
              )}
            </div>
            <PartnerFields partner={partner} onSave={(patch) => run(() => savePartner(patch))} />
            <label
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              title="Upload logo"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden /> Logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void uploadLogo(partner, file);
                }}
              />
            </label>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={() => move(index, -1)} disabled={pending || index === 0} aria-label="Move up" className="p-1 text-slate-400 hover:text-brand-700 disabled:opacity-30">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={pending || index === partners.length - 1} aria-label="Move down" className="p-1 text-slate-400 hover:text-brand-700 disabled:opacity-30">
                <ArrowDown className="h-4 w-4" />
              </button>
              <ConfirmButton onConfirm={() => run(() => deletePartner(partner.id))}>
                Delete
              </ConfirmButton>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          run(() =>
            savePartner({
              name: "New partner",
              url: null,
              logoMediaId: null,
              sortOrder: partners.length + 1,
            }),
          )
        }
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" aria-hidden /> Add partner
      </button>
    </div>
  );
}

function PartnerFields({
  partner,
  onSave,
}: {
  partner: PartnerRow;
  onSave: (payload: {
    id: string;
    name: string;
    url: string | null;
    logoMediaId: string | null;
    sortOrder: number;
  }) => void;
}) {
  const [name, setName] = useState(partner.name);
  const [url, setUrl] = useState(partner.url ?? "");
  const dirty = name !== partner.name || url !== (partner.url ?? "");

  return (
    <div className="flex flex-1 items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Partner name"
        className={`${inputClass} mt-0 flex-1`}
      />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https:// (optional)"
        className={`${inputClass} mt-0 flex-1`}
      />
      {dirty && (
        <button
          type="button"
          onClick={() =>
            onSave({
              id: partner.id,
              name,
              url: url || null,
              logoMediaId: partner.logo?.id ?? null,
              sortOrder: partner.sort_order,
            })
          }
          className="rounded-md bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800"
        >
          Save
        </button>
      )}
    </div>
  );
}
