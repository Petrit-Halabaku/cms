import { BrandingManager } from "@/components/admin/BrandingManager";
import { requireEditor } from "@/lib/admin/auth";
import { getLogoUrl } from "@/lib/db/content";

export const metadata = { title: "Branding — Gergoci Admin" };

export default async function BrandingAdminPage() {
  await requireEditor();
  const logoUrl = await getLogoUrl();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Branding</h1>
      <p className="mt-1 text-sm text-slate-500">
        The site logo, shown in the header, mobile menu and footer.
      </p>
      <div className="mt-6">
        <BrandingManager initialLogoUrl={logoUrl} />
      </div>
    </div>
  );
}
