import { CategoryForm } from "@/components/admin/CategoryForm";
import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "New category — Gergoci Admin" };

export default async function NewCategoryPage() {
  await requireEditor();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">New category</h1>
      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}
