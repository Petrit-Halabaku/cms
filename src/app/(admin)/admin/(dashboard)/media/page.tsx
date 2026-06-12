import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Media — Gergoci Admin" };

export default async function MediaAdminPage() {
  const { supabase } = await requireEditor();
  const { data: media } = await supabase
    .from("media")
    .select("id, storage_path, alt_en, alt_sq, width, height, mime_type")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Media library</h1>
      <p className="mt-1 text-sm text-slate-500">
        Images used across products, pages and partner logos. Files still in use cannot be deleted.
      </p>
      <div className="mt-6">
        <MediaLibrary media={media ?? []} />
      </div>
    </div>
  );
}
