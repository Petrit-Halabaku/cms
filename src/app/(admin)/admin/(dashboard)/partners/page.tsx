import { PartnersManager } from "@/components/admin/PartnersManager";
import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Partners — Gergoci Admin" };

export default async function PartnersAdminPage() {
  const { supabase } = await requireEditor();
  const { data: partners } = await supabase
    .from("partners")
    .select("id, name, url, sort_order, media(id, storage_path)")
    .order("sort_order");

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Partners</h1>
      <p className="mt-1 text-sm text-slate-500">
        Logos shown in the partner strip on the homepage.
      </p>
      <div className="mt-6">
        <PartnersManager
          partners={(partners ?? []).map((partner) => ({
            id: partner.id,
            name: partner.name,
            url: partner.url,
            sort_order: partner.sort_order,
            logo: partner.media,
          }))}
        />
      </div>
    </div>
  );
}
