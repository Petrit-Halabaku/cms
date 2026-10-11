import { requireAdmin } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";

import { UsersManager, type AdminUser } from "./UsersManager";

export const metadata = { title: "Users — Gergoci Admin" };

export default async function UsersAdminPage() {
  const { user: currentUser } = await requireAdmin();

  const service = createServiceClient();

  const [{ data: authData }, { data: profiles }] = await Promise.all([
    service.auth.admin.listUsers({ perPage: 1000 }),
    service.from("profiles").select("id, role"),
  ]);

  const roleById = new Map((profiles ?? []).map((p) => [p.id, p.role]));

  // Only surface accounts that have a dashboard profile; ignore any stray auth users.
  const users: AdminUser[] = (authData?.users ?? [])
    .filter((u) => roleById.has(u.id))
    .map((u) => ({
      id: u.id,
      email: u.email ?? "—",
      role: roleById.get(u.id) ?? "editor",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
    }))
    .sort((a, b) => a.email.localeCompare(b.email));

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-brand-700">
          Access
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-slate-900">Users</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          People who can sign in to this dashboard. <strong>Admins</strong> have full access,
          including managing users. <strong>Editors</strong> can edit all content but cannot add
          or remove users.
        </p>
      </header>

      <UsersManager users={users} currentUserId={currentUser.id} />
    </div>
  );
}
