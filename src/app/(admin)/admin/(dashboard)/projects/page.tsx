import { ProjectsGalleryManager } from "@/components/admin/ProjectsGalleryManager";
import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Projects — Gergoci Admin" };

const GALLERY = "projects";
const FOLDER = "projects";
const IMAGE_RE = /\.(webp|jpe?g|png|avif)$/i;

export default async function ProjectsAdminPage() {
  const { supabase } = await requireEditor();
  const [{ data: rows }, { data: files }] = await Promise.all([
    supabase
      .from("gallery_images")
      .select("id, storage_path, alt, sort_order")
      .eq("gallery", GALLERY)
      .order("sort_order", { ascending: true }),
    supabase.storage.from("media").list(FOLDER, { limit: 100 }),
  ]);
  const folderCount = (files ?? []).filter((o) => o.id && IMAGE_RE.test(o.name)).length;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Our projects</h1>
      <p className="mt-1 text-sm text-slate-500">
        Photos shown in the homepage “Our projects” band. Upload, remove and reorder them here.
      </p>
      <div className="mt-6">
        <ProjectsGalleryManager
          gallery={GALLERY}
          folder={FOLDER}
          images={(rows ?? []).map((r) => ({ id: r.id, path: r.storage_path, alt: r.alt ?? "" }))}
          folderCount={folderCount}
        />
      </div>
    </div>
  );
}
