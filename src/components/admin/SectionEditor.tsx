"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Check, ChevronDown, Trash2 } from "lucide-react";

import { Field, LocaleTabs, inputClass } from "@/components/admin/ui";
import { saveSectionContent } from "@/lib/admin/actions/pages";
import { uploadFile } from "@/lib/admin/upload";
import { HERO_MEDIA_FOLDER, isVideoPath, storageUrl } from "@/lib/site";

/**
 * Friendly editor for one page section's jsonb content, per locale.
 * Renders typed inputs based on the section type — no raw JSON.
 */

type Locale = "en" | "sq";
type Content = Record<string, unknown>;
type MediaOption = { id: string; storage_path: string; alt_en: string | null };

type Props = {
  sectionId: string;
  sectionKey: string;
  type: string;
  initial: { en: Content; sq: Content };
  mediaOptions: MediaOption[];
  categoryOptions: { id: string; name: string }[];
  /** Shown on the live site when true. */
  active: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero banner",
  cards: "Card grid",
  grid: "Feature grid",
  "product-grid": "Featured products",
  faq: "FAQ block",
  "logo-strip": "Partner logos",
  counters: "Number counters",
  location: "Location & hours",
  cta: "Call to action",
  "rich-text": "Text block",
  list: "Bullet list",
  gallery: "Image gallery",
  "contact-info": "Contact details",
};

export function SectionEditor({
  sectionId,
  sectionKey,
  type,
  initial,
  mediaOptions,
  categoryOptions,
  active: initialActive,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [locale, setLocale] = useState<Locale>("en");
  const [content, setContent] = useState(initial);
  const [active, setActive] = useState(initialActive);
  const [dirty, setDirty] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const markDirty = () => {
    setDirty(true);
    setStatus("idle");
  };
  const current = content[locale];
  const set = (key: string, value: unknown) => {
    markDirty();
    setContent((prev) => ({ ...prev, [locale]: { ...prev[locale], [key]: value } }));
  };
  /** Hero background media is one file for the whole page — set it on both locales. */
  const setMediaBoth = (path: string) => {
    markDirty();
    setContent((prev) => ({
      en: { ...prev.en, media_path: path },
      sq: { ...prev.sq, media_path: path },
    }));
  };
  const str = (key: string) => String((current[key] as string | number | undefined) ?? "");
  const num = (key: string) => Number(current[key] ?? 0);
  const items = <T,>(key: string): T[] => (Array.isArray(current[key]) ? (current[key] as T[]) : []);

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveSectionContent(sectionId, type, content, { active });
      if (!result.ok) {
        setStatus("error");
        setError(result.error);
        return;
      }
      setDirty(false);
      setStatus("saved");
      router.refresh();
    });
  }

  function cancel() {
    setContent(initial);
    setActive(initialActive);
    setDirty(false);
    setError(null);
    setStatus("idle");
  }

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-6 transition-shadow ${
        dirty ? "ring-2 ring-amber-400 ring-offset-4 ring-offset-slate-50" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          className="flex flex-1 items-center gap-2.5 text-left"
        >
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${collapsed ? "-rotate-90" : ""}`}
            aria-hidden
          />
          <span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {SECTION_LABELS[type] ?? type}
              </span>
              {!active && (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-slate-600 uppercase">
                  Hidden
                </span>
              )}
              {dirty && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-amber-700 uppercase">
                  Unsaved
                </span>
              )}
            </span>
            <span className="block text-xs text-slate-400">{sectionKey}</span>
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label="Move section up"
            className="p-1 text-slate-400 hover:text-brand-700 disabled:opacity-30"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label="Move section down"
            className="p-1 text-slate-400 hover:text-brand-700 disabled:opacity-30"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          {!collapsed && <LocaleTabs locale={locale} onChange={setLocale} />}
        </div>
      </div>

      {!collapsed && (
        <>
          {dirty && (
            <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
              Draft — you have unsaved changes. They’ll be lost if you cancel or leave without saving.
            </div>
          )}
          <div className="mt-5 space-y-4">
        {"heading" in mergeKeys(type) && (
          <Field label="Heading">
            <input type="text" value={str("heading")} onChange={(e) => set("heading", e.target.value)} className={inputClass} />
          </Field>
        )}

        {type === "hero" && (
          <>
            <Field label="Subheading">
              <textarea rows={2} value={str("subheading")} onChange={(e) => set("subheading", e.target.value)} className={inputClass} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button label">
                <input type="text" value={str("cta_label")} onChange={(e) => set("cta_label", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Phone number">
                <input type="text" value={str("phone")} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
              </Field>
            </div>
            <HeroMediaField
              path={str("media_path")}
              alt={str("media_alt")}
              onPath={setMediaBoth}
              onAlt={(v) => set("media_alt", v)}
            />
          </>
        )}

        {(type === "cards" || type === "grid") && (
          <ItemListEditor
            items={items<{ title: string; body: string; category_id: string }>("items")}
            onChange={(next) => set("items", next)}
            fields={[
              { key: "title", label: "Title" },
              { key: "body", label: "Text", rows: 2 },
              {
                key: "category_id",
                label: "Links to category",
                type: "select",
                options: [
                  { value: "", label: "— Products page —" },
                  ...categoryOptions.map((c) => ({ value: c.id, label: c.name })),
                ],
              },
            ]}
            newItem={{ title: "", body: "", category_id: "" }}
          />
        )}

        {type === "counters" && (
          <ItemListEditor
            items={items<{ label: string; value: string }>("items")}
            onChange={(next) => set("items", next)}
            fields={[
              { key: "value", label: "Value (e.g. 25+)" },
              { key: "label", label: "Label" },
            ]}
            newItem={{ label: "", value: "" }}
          />
        )}

        {(type === "cta" || type === "rich-text") && (
          <Field label="Text">
            <textarea rows={type === "rich-text" ? 8 : 3} value={str("body")} onChange={(e) => set("body", e.target.value)} className={inputClass} />
          </Field>
        )}
        {type === "cta" && (
          <Field label="Button label">
            <input type="text" value={str("cta_label")} onChange={(e) => set("cta_label", e.target.value)} className={inputClass} />
          </Field>
        )}

        {type === "list" && (
          <StringListEditor items={items<string>("items")} onChange={(next) => set("items", next)} />
        )}

        {(type === "location" || type === "contact-info") && (
          <>
            <Field label="Address">
              <input type="text" value={str("address")} onChange={(e) => set("address", e.target.value)} className={inputClass} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone">
                <input type="text" value={str("phone")} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Phone 2 (optional)">
                <input type="text" value={str("phone2")} onChange={(e) => set("phone2", e.target.value)} className={inputClass} />
              </Field>
            </div>
            {type === "contact-info" && (
              <Field label="Email">
                <input type="email" value={str("email")} onChange={(e) => set("email", e.target.value)} className={inputClass} />
              </Field>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Map latitude">
                <input type="number" step="0.0001" value={num("lat")} onChange={(e) => set("lat", Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Map longitude">
                <input type="number" step="0.0001" value={num("lng")} onChange={(e) => set("lng", Number(e.target.value))} className={inputClass} />
              </Field>
            </div>
          </>
        )}

        {type === "location" && (
          <ItemListEditor
            items={items<{ days: string; hours: string }>("hours")}
            onChange={(next) => set("hours", next)}
            fields={[
              { key: "days", label: "Days (e.g. Monday – Friday)" },
              { key: "hours", label: "Hours (e.g. 08:00 – 17:00)" },
            ]}
            newItem={{ days: "", hours: "" }}
            heading="Opening hours"
          />
        )}

        {type === "gallery" && (
          <MediaMultiPicker
            selected={items<string>("media_ids")}
            onChange={(next) => set("media_ids", next)}
            options={mediaOptions}
          />
        )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => {
                  setActive(e.target.checked);
                  markDirty();
                }}
                className="h-4 w-4 rounded-sm border-slate-300 text-brand-700 focus:ring-brand-700"
              />
              Active <span className="text-xs text-slate-400">shown on site</span>
            </label>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save section"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={pending}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            {status === "saved" && (
              <span className="inline-flex items-center gap-1 text-sm text-green-700">
                <Check className="h-4 w-4" aria-hidden /> Saved
              </span>
            )}
            {status === "error" && error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </>
      )}
    </div>
  );
}

/** Which common keys a type uses (heading shown for all current types). */
function mergeKeys(type: string): Record<string, true> {
  void type;
  return { heading: true };
}

function ItemListEditor<T extends Record<string, string>>({
  items,
  onChange,
  fields,
  newItem,
  heading,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  fields: {
    key: keyof T & string;
    label: string;
    rows?: number;
    type?: "select";
    options?: { value: string; label: string }[];
  }[];
  newItem: T;
  heading?: string;
}) {
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      {heading && <p className="text-sm font-medium text-slate-900">{heading}</p>}
      <div className="mt-2 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-md border border-slate-200 p-3">
            <div className="flex justify-end gap-1">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" className="p-1 text-slate-400 hover:text-brand-700 disabled:opacity-30">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down" className="p-1 text-slate-400 hover:text-brand-700 disabled:opacity-30">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Remove" className="p-1 text-slate-400 hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field) =>
                field.type === "select" ? (
                  <select
                    key={field.key}
                    value={item[field.key] ?? ""}
                    onChange={(e) =>
                      onChange(items.map((it, i) => (i === index ? { ...it, [field.key]: e.target.value } : it)))
                    }
                    className={`${inputClass} mt-0 bg-white`}
                  >
                    {(field.options ?? []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : field.rows ? (
                  <textarea
                    key={field.key}
                    rows={field.rows}
                    value={item[field.key] ?? ""}
                    placeholder={field.label}
                    onChange={(e) =>
                      onChange(items.map((it, i) => (i === index ? { ...it, [field.key]: e.target.value } : it)))
                    }
                    className={`${inputClass} mt-0`}
                  />
                ) : (
                  <input
                    key={field.key}
                    type="text"
                    value={item[field.key] ?? ""}
                    placeholder={field.label}
                    onChange={(e) =>
                      onChange(items.map((it, i) => (i === index ? { ...it, [field.key]: e.target.value } : it)))
                    }
                    className={`${inputClass} mt-0`}
                  />
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, { ...newItem }])}
        className="mt-2 text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        + Add item
      </button>
    </div>
  );
}

function StringListEditor({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-900">List items</p>
      <div className="mt-2 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(items.map((it, i) => (i === index ? e.target.value : it)))}
              className={`${inputClass} mt-0 flex-1`}
            />
            <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Remove" className="p-1.5 text-slate-400 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2 text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        + Add item
      </button>
    </div>
  );
}

/** Upload + preview for the hero background (WebP image now, MP4/WebM video later). */
function HeroMediaField({
  path,
  alt,
  onPath,
  onAlt,
}: {
  path: string;
  alt: string;
  onPath: (path: string) => void;
  onAlt: (alt: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isVideo = isVideoPath(path);

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    const result = await uploadFile("media", file, HERO_MEDIA_FOLDER, { allowVideo: true });
    setBusy(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    onPath(result.path);
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-900">Background media</p>
      <p className="text-xs text-slate-400">
        Shown full-bleed behind the hero text. WebP image now, or an MP4/WebM video later.
        Remember to click “Save section” after uploading.
      </p>
      <div className="mt-2 flex items-start gap-4">
        <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
          {path ? (
            isVideo ? (
              <video
                src={storageUrl("media", path)}
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storageUrl("media", path)} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <span className="grid h-full w-full place-items-center text-xs text-slate-400">
              No media
            </span>
          )}
        </div>
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 aria-disabled:opacity-60">
            {busy ? "Uploading…" : path ? "Replace media" : "Upload media"}
            <input
              type="file"
              accept="image/webp,video/mp4,video/webm"
              onChange={onUpload}
              disabled={busy}
              className="hidden"
            />
          </label>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <div className="mt-3">
        <Field label="Image alt text (accessibility)">
          <input type="text" value={alt} onChange={(e) => onAlt(e.target.value)} className={inputClass} />
        </Field>
      </div>
    </div>
  );
}

function MediaMultiPicker({
  selected,
  onChange,
  options,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  options: MediaOption[];
}) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  if (options.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No images in the media library yet — upload some under Media first.
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium text-slate-900">
        Gallery images <span className="font-normal text-slate-400">({selected.length} selected)</span>
      </p>
      <div className="mt-2 grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5">
        {options.map((media) => {
          const isSelected = selected.includes(media.id);
          return (
            <button
              key={media.id}
              type="button"
              onClick={() => toggle(media.id)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                isSelected ? "border-brand-600" : "border-transparent"
              }`}
              title={media.alt_en ?? ""}
            >
              <Image
                src={storageUrl("media", media.storage_path)}
                alt={media.alt_en ?? ""}
                fill
                sizes="120px"
                className="object-cover"
              />
              {isSelected && (
                <span className="absolute right-1 top-1 rounded-full bg-brand-700 p-0.5 text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
